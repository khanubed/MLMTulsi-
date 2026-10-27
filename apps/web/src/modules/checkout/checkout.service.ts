import crypto from 'crypto';
import { OrderPurpose } from '@prisma/client';
import { prisma } from '../../lib/db';
import { BadRequestError, NotFoundError } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { NetworkService } from '../network/network.service';
import { ProviderFactory } from '../providers/provider.factory';
import {
  CustomerDetailsSchema,
  type CustomerDetailsInput,
  parseIndianMobile,
} from '../../lib/validations/checkout';

export interface CreateSessionInput {
  productId?: string;
  productSlug?: string;
  quantity?: number;
  purpose?: OrderPurpose;
}

export type { CustomerDetailsInput };

export class CheckoutService {
  /**
   * Step 2: Create a checkout session without user registration
   */
  static async createSession(input: CreateSessionInput) {
    const quantity = input.quantity && input.quantity > 0 ? input.quantity : 1;
    const purpose = input.purpose || OrderPurpose.INITIAL_REGISTRATION;

    // Authoritative product retrieval
    let product;
    if (input.productId) {
      product = await prisma.product.findUnique({
        where: { id: input.productId },
      });
    } else if (input.productSlug) {
      product = await prisma.product.findUnique({
        where: { slug: input.productSlug },
      });
    } else {
      // Default to flagship product
      product = await prisma.product.findFirst({
        where: { isActive: true },
      });
    }

    if (!product) {
      throw new NotFoundError('Selected product is not found or inactive');
    }

    if (!product.isActive) {
      throw new BadRequestError('This product is not currently available for purchase');
    }

    // Authoritative server pricing (₹500 = 50,000 paise per unit)
    const unitPricePaise = product.pricePaise;
    const totalAmountPaise = unitPricePaise * BigInt(quantity);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour session

    const session = await prisma.checkoutSession.create({
      data: {
        productId: product.id,
        quantity,
        unitPricePaise,
        totalAmountPaise,
        purpose,
        status: 'INITIATED',
        expiresAt,
      },
      include: {
        product: {
          select: { id: true, name: true, slug: true, sku: true, pricePaise: true },
        },
      },
    });

    logger.info('Checkout session initiated', {
      meta: { sessionId: session.id, productId: product.id, totalAmountPaise: Number(totalAmountPaise) },
    });

    return session;
  }

  /**
   * Retrieve session by ID
   */
  static async getSession(sessionId: string) {
    const session = await prisma.checkoutSession.findUnique({
      where: { id: sessionId },
      include: {
        product: {
          select: { id: true, name: true, slug: true, sku: true, pricePaise: true },
        },
        order: {
          select: { id: true, orderNumber: true, status: true, paymentStatus: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Checkout session not found');
    }

    return session;
  }

  /**
   * Step 3: Update customer details and delivery address
   */
  static async updateCustomerDetails(sessionId: string, input: CustomerDetailsInput) {
    const session = await this.getSession(sessionId);

    if (session.status === 'CONFIRMED' || session.status === 'EXPIRED') {
      throw new BadRequestError(`Cannot edit session in "${session.status}" status`);
    }

    // Comprehensive Zod validation across all customer details & shipping fields
    const parseResult = CustomerDetailsSchema.safeParse(input);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0]?.message || 'Invalid customer details provided';
      throw new BadRequestError(firstIssue, parseResult.error.flatten());
    }

    const validData = parseResult.data;

    // Authoritative Indian mobile number verification and E.164 normalization
    const phoneParse = parseIndianMobile(validData.phone);
    if (!phoneParse.isValid || !phoneParse.e164) {
      throw new BadRequestError(
        phoneParse.error || 'Please provide a valid 10-digit Indian mobile number starting with 6-9'
      );
    }
    const phoneE164 = phoneParse.e164;

    // Normalize shipping address phone as well
    const shippingPhoneParse = parseIndianMobile(validData.shippingAddress.phone);
    const normalizedShippingAddress = {
      ...validData.shippingAddress,
      phone: shippingPhoneParse.e164 || validData.shippingAddress.phone,
    };

    const updated = await prisma.checkoutSession.update({
      where: { id: sessionId },
      data: {
        customerName: validData.fullName.trim(),
        customerPhone: phoneE164,
        customerEmail: validData.email?.trim().toLowerCase() || null,
        shippingAddress: normalizedShippingAddress as any,
        status: session.phoneVerifiedAt ? 'PHONE_VERIFIED' : 'DETAILS_PROVIDED',
      },
    });

    return updated;
  }

  /**
   * Step 4: Validate referral code and determine placement
   */
  static async validateReferral(sessionId: string, referralCode: string, preferredSlot?: number) {
    const session = await this.getSession(sessionId);

    if (session.status === 'CONFIRMED' || session.status === 'EXPIRED') {
      throw new BadRequestError(`Cannot update referral in "${session.status}" status`);
    }

    // Validate referral code against network nodes
    const { node: sponsorNode } = await NetworkService.validateReferralCode(referralCode);

    // Determine placement slot and parent (direct or spillover)
    const placement = await NetworkService.findPlacementSlot(sponsorNode.id, preferredSlot);

    const updated = await prisma.checkoutSession.update({
      where: { id: sessionId },
      data: {
        referralCode: sponsorNode.referralCode,
        sponsorNetworkId: sponsorNode.id,
        intendedParentId: placement.parentId,
        intendedSlot: placement.slotNumber,
      },
    });

    return {
      session: updated,
      sponsor: {
        publicId: sponsorNode.publicId,
        referralCode: sponsorNode.referralCode,
        ownerName: sponsorNode.ownerName,
      },
      placement: {
        parentId: placement.parentId,
        slotNumber: placement.slotNumber,
        isSpillover: placement.isSpillover,
      },
    };
  }

  /**
   * Step 5: Request OTP verification challenge
   */
  static async requestPhoneOtp(sessionId: string) {
    const session = await this.getSession(sessionId);

    if (session.status === 'CONFIRMED') {
      throw new BadRequestError('Checkout session has already been confirmed');
    }

    if (session.status === 'EXPIRED' || session.expiresAt < new Date()) {
      throw new BadRequestError('Checkout session has expired. Please create a new session');
    }

    if (!session.customerPhone) {
      throw new BadRequestError('Please provide customer phone number in step 3 before requesting OTP');
    }

    // 60-second resend cooldown check
    const recentChallenge = await prisma.otpChallenge.findFirst({
      where: {
        checkoutSessionId: sessionId,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentChallenge) {
      const waitSeconds = Math.ceil((recentChallenge.createdAt.getTime() + 60000 - Date.now()) / 1000);
      throw new BadRequestError(`Please wait ${waitSeconds}s before requesting a new OTP`);
    }

    // Generate cryptographically secure 6-digit random code
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const codeHash = crypto.createHash('sha256').update(otpCode).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const challenge = await prisma.otpChallenge.create({
      data: {
        phoneE164: session.customerPhone,
        purpose: 'CHECKOUT_VERIFICATION',
        codeHash,
        checkoutSessionId: sessionId,
        expiresAt,
        maxAttempts: 5,
      },
    });

    // Invoke configured OTP Provider
    const otpProvider = ProviderFactory.getOtpProvider();
    const dispatchResult = await otpProvider.sendOtp({
      phone: session.customerPhone,
      code: otpCode,
      expiresAt,
      checkoutSessionId: sessionId,
    });

    return {
      challengeId: challenge.id,
      phone: session.customerPhone,
      expiresInSeconds: dispatchResult.expiresInSeconds,
      developmentOtp: dispatchResult.developmentOtp,
    };
  }

  /**
   * Step 6: Verify Phone OTP code
   */
  static async verifyPhoneOtp(sessionId: string, challengeId: string, code: string) {
    const session = await this.getSession(sessionId);

    if (!code || code.trim().length !== 6) {
      throw new BadRequestError('Verification code must be 6 digits');
    }

    const challenge = await prisma.otpChallenge.findFirst({
      where: {
        id: challengeId,
        checkoutSessionId: sessionId,
      },
    });

    if (!challenge) {
      throw new NotFoundError('OTP challenge not found for this session');
    }

    if (challenge.consumedAt) {
      throw new BadRequestError('This OTP code has already been used');
    }

    if (challenge.expiresAt < new Date()) {
      throw new BadRequestError('This OTP code has expired. Please request a new one');
    }

    if (challenge.attemptCount >= challenge.maxAttempts) {
      throw new BadRequestError('Maximum verification attempts exceeded. Please request a new OTP');
    }

    // Increment attempt count
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { attemptCount: { increment: 1 } },
    });

    // Verify hash with timing-safe comparison
    const incomingHash = crypto.createHash('sha256').update(code.trim()).digest('hex');
    const hashMatches = crypto.timingSafeEqual(
      Buffer.from(incomingHash),
      Buffer.from(challenge.codeHash)
    );

    if (!hashMatches) {
      throw new BadRequestError('Invalid OTP code. Please check and try again');
    }

    // Mark challenge consumed
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });

    // Update session state
    const now = new Date();
    await prisma.checkoutSession.update({
      where: { id: sessionId },
      data: {
        phoneVerifiedAt: now,
        status: 'PHONE_VERIFIED',
      },
    });

    // Check if customer already exists for this phone (without exposing user details)
    const existingUser = await prisma.user.findUnique({
      where: { phoneE164: session.customerPhone! },
      select: { id: true, role: true },
    });

    return {
      verified: true,
      phone: session.customerPhone,
      verifiedAt: now,
      isExistingUser: !!existingUser,
    };
  }

  /**
   * Step 7: Confirm checkout and create pending order
   */
  static async confirmCheckout(sessionId: string, idempotencyKey?: string) {
    const session = await this.getSession(sessionId);

    // Idempotency: Return existing order if already created
    if (session.orderId) {
      const existingOrder = await prisma.order.findUnique({
        where: { id: session.orderId },
      });
      if (existingOrder) {
        return existingOrder;
      }
    }

    if (!session.phoneVerifiedAt) {
      throw new BadRequestError('Phone number must be verified via OTP before confirming order');
    }

    if (!session.customerName || !session.customerPhone || !session.shippingAddress) {
      throw new BadRequestError('Customer details and shipping address are required to confirm checkout');
    }

    if (session.expiresAt < new Date()) {
      throw new BadRequestError('Checkout session has expired. Please start over');
    }

    const orderNumber = `TS-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Resolve or create Address in the addresses table
    const shippingData = session.shippingAddress as Record<string, any>;
    const existingUser = await prisma.user.findUnique({
      where: { phoneE164: session.customerPhone },
      select: { id: true },
    });

    let addressId: string | null = null;
    if (existingUser) {
      const existingAddress = await prisma.address.findFirst({
        where: {
          userId: existingUser.id,
          addressLine1: shippingData.addressLine1,
          postalCode: shippingData.postalCode,
        },
      });
      if (existingAddress) {
        addressId = existingAddress.id;
      }
    }

    if (!addressId) {
      const newAddress = await prisma.address.create({
        data: {
          userId: existingUser?.id || null,
          fullName: shippingData.fullName || session.customerName,
          phone: shippingData.phone || session.customerPhone,
          addressLine1: shippingData.addressLine1,
          addressLine2: shippingData.addressLine2 || null,
          landmark: shippingData.landmark || null,
          city: shippingData.city,
          state: shippingData.state,
          postalCode: shippingData.postalCode,
          country: shippingData.country || 'India',
          type: 'SHIPPING',
          isDefault: existingUser ? false : true,
        },
      });
      addressId = newAddress.id;
    }

    // Create Order with pending payment referencing Address row
    const order = await prisma.order.create({
      data: {
        orderNumber,
        productId: session.productId,
        productNameSnapshot: session.product.name,
        productSlugSnapshot: session.product.slug,
        skuSnapshot: session.product.sku,
        purpose: session.purpose,
        quantity: session.quantity,
        unitPricePaise: session.unitPricePaise,
        subtotalPaise: session.totalAmountPaise,
        totalAmountPaise: session.totalAmountPaise,
        status: 'PENDING_PAYMENT',
        paymentStatus: 'INITIATED',
        customerName: session.customerName,
        customerPhone: session.customerPhone,
        customerEmail: session.customerEmail,
        shippingAddressId: addressId,
        referralCodeUsed: session.referralCode,
        intendedParentNetworkId: session.intendedParentId,
        idempotencyKey: idempotencyKey || `chk_${sessionId}`,
      },
    });

    // Link order to session and update session status
    await prisma.checkoutSession.update({
      where: { id: sessionId },
      data: {
        orderId: order.id,
        status: 'CONFIRMED',
      },
    });

    logger.info('Checkout confirmed and pending order created', {
      meta: {
        sessionId,
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalPaise: Number(order.totalAmountPaise),
      },
    });

    return order;
  }
}
