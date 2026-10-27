import crypto from 'crypto';
import { OrderPurpose, OrderStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '../../lib/db';
import { BadRequestError, NotFoundError } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { CommissionsService } from '../commissions/commissions.service';
import { CommissionSummaryService } from '../commissions/commission-summary.service';
import { NetworkService } from '../network/network.service';
import { ProviderFactory } from '../providers/provider.factory';

export class FinalizationService {
  /**
   * Primary authoritative finalization method.
   * Invoked after payment confirmation (mock simulator or real PhonePe server callback).
   * Executes within a short atomic database transaction with retry & idempotency guarantees.
   */
  static async finalizePaidOrder(orderId: string, verifiedPaymentReference?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        checkoutSession: true,
      },
    });

    if (!order) {
      throw new NotFoundError(`Order ${orderId} not found`);
    }

    // 1. Idempotency Guard: If order is already paid, return early safely without duplicate writes
    if (order.status === OrderStatus.PAID || order.status === OrderStatus.CONFIRMED) {
      logger.info('Order is already finalized. Returning existing result.', { meta: { orderId } });
      const existingUser = order.userId
        ? await prisma.user.findUnique({ where: { id: order.userId } })
        : null;
      const existingNetworkId = order.networkIdId
        ? await prisma.networkId.findUnique({ where: { id: order.networkIdId } })
        : null;

      return {
        alreadyFinalized: true,
        finalized: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        customer: existingUser
          ? { id: existingUser.id, fullName: existingUser.fullName, phone: existingUser.phoneE164 }
          : null,
        network: existingNetworkId
          ? {
              id: existingNetworkId.id,
              publicId: existingNetworkId.publicId,
              referralCode: existingNetworkId.referralCode,
              depth: existingNetworkId.placementDepth,
            }
          : null,
      };
    }

    const latestPayment = order.payments[0];
    if (!latestPayment) {
      throw new BadRequestError('No payment record found for this order');
    }

    // Verify amount and currency integrity (server authoritative)
    if (latestPayment.amountPaise !== order.totalAmountPaise) {
      throw new BadRequestError(
        `Payment amount mismatch: expected ${order.totalAmountPaise} paise, received ${latestPayment.amountPaise} paise`
      );
    }
    if (latestPayment.currency !== order.currency) {
      throw new BadRequestError(
        `Payment currency mismatch: expected ${order.currency}, received ${latestPayment.currency}`
      );
    }

    // 2. Authoritative Provider Verification (Outside DB transaction)
    const paymentProvider = ProviderFactory.getPaymentProvider();
    const providerStatus = await paymentProvider.getPaymentStatus({
      merchantTransactionId: verifiedPaymentReference || latestPayment.merchantOrderId,
      orderId: order.id,
    });

    if (providerStatus.status !== 'SUCCESS') {
      logger.warn('Cannot finalize order: Payment is not verified as SUCCESS', {
        meta: { orderId, providerStatus: providerStatus.status },
      });
      return {
        finalized: false,
        status: providerStatus.status,
        message: 'Payment has not been completed successfully.',
      };
    }

    // 3. Atomic Database Finalization Transaction (30s timeout, maxWait 15s)
    const result = await prisma.$transaction(
      async (tx) => {
        // Re-fetch order within transaction lock
        const currentOrder = await tx.order.findUniqueOrThrow({
          where: { id: orderId },
        });

        if (currentOrder.status === OrderStatus.PAID || currentOrder.status === OrderStatus.CONFIRMED) {
          return { alreadyFinalized: true, order: currentOrder, user: null, networkId: null };
        }

        // 4. Resolve or create customer account (User by unique phoneE164)
        let user = await tx.user.findUnique({
          where: { phoneE164: currentOrder.customerPhone },
        });

        if (!user) {
          user = await tx.user.create({
            data: {
              fullName: currentOrder.customerName,
              phoneE164: currentOrder.customerPhone,
              phoneVerifiedAt: new Date(),
              email: currentOrder.customerEmail,
              role: 'MEMBER',
              status: 'ACTIVE',
            },
          });

          logger.info('New customer account registered post-payment', {
            meta: { userId: user.id, phone: user.phoneE164 },
          });
        }

        // 4b. Ensure referenced Address is linked to User's address book
        if (currentOrder.shippingAddressId) {
          const linkedAddress = await tx.address.findUnique({
            where: { id: currentOrder.shippingAddressId },
          });

          if (linkedAddress && !linkedAddress.userId) {
            const hasDefault = await tx.address.findFirst({
              where: { userId: user.id, isDefault: true },
            });

            await tx.address.update({
              where: { id: currentOrder.shippingAddressId },
              data: {
                userId: user.id,
                isDefault: !hasDefault,
              },
            });
          }
        }

        let createdNetworkId = null;

        // 5. Handle Network Identity & Placement based on Purpose
        if (
          currentOrder.purpose === OrderPurpose.INITIAL_REGISTRATION ||
          currentOrder.purpose === OrderPurpose.ADDITIONAL_ID
        ) {
          // Check for existing active NetworkId if INITIAL_REGISTRATION
          if (currentOrder.purpose === OrderPurpose.INITIAL_REGISTRATION) {
            const existingNode = await tx.networkId.findFirst({
              where: { ownerUserId: user.id, status: 'ACTIVE' },
            });
            if (existingNode) {
              logger.info('User already has an active NetworkId for INITIAL_REGISTRATION; reusing node.', {
                meta: {
                  userId: user.id,
                  networkId: existingNode.id,
                },
              });
              createdNetworkId = existingNode;
            }
          }

          if (!createdNetworkId) {
            // Find existing company root or fallback
            const rootNode = await tx.networkId.findFirst({
              where: { parentNetworkId: null, status: 'ACTIVE' },
            });

            let targetParentId = currentOrder.intendedParentNetworkId || rootNode?.id;

            if (!targetParentId) {
              throw new BadRequestError(
                'Cannot place network position: No active sponsor or company root node exists in database. Run seed bootstrap first.'
              );
            }

            // Verify parent node eligibility
            const parentNode = await tx.networkId.findUnique({
              where: { id: targetParentId },
            });

            if (!parentNode || parentNode.status !== 'ACTIVE') {
              throw new BadRequestError('Intended parent network node is inactive or invalid');
            }

            // Find placement slot under parent (checking direct 1..3 slots or spillover)
            const placement = await NetworkService.findPlacementSlot(targetParentId, undefined, tx);
            const finalParentId = placement.parentId;
            const finalSlot = placement.slotNumber;

            // Generate collision-resistant unique publicId and referralCode (cryptographically random)
            const publicId = `TS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
            const referralCode = `TS${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

            // Calculate placement depth
            const finalParent = await tx.networkId.findUnique({
              where: { id: finalParentId },
              select: { placementDepth: true },
            });
            const placementDepth = (finalParent?.placementDepth || 0) + 1;

            // Create Network ID
            createdNetworkId = await tx.networkId.create({
              data: {
                publicId,
                referralCode,
                ownerUserId: user.id,
                parentNetworkId: finalParentId,
                placementDepth,
                status: 'ACTIVE',
                qualifyingOrderId: currentOrder.id,
              },
            });

            // Record placement slot (enforced by @@unique([parentNetworkId, slotNumber]))
            await tx.networkPlacement.create({
              data: {
                parentNetworkId: finalParentId,
                slotNumber: finalSlot,
                childNetworkId: createdNetworkId.id,
              },
            });

            // Pre-initialize 10 levels in NetworkLevelSummary for the new node
            await CommissionSummaryService.initializeSummariesForNetwork(createdNetworkId.id, tx);

            // 6. Allocate Upline Commissions (10 relative levels, in HELD status)
            await CommissionsService.allocateCommissionsForOrder(
              tx,
              currentOrder.id,
              createdNetworkId.id
            );
          }
        }

        // 7. Update Payment record
        await tx.payment.updateMany({
          where: { orderId: currentOrder.id },
          data: {
            status: 'SUCCESS',
            verifiedAt: new Date(),
            mockStatus: 'SUCCESS',
          },
        });

        // 8. Update Order record
        const updatedOrder = await tx.order.update({
          where: { id: currentOrder.id },
          data: {
            userId: user.id,
            networkIdId: createdNetworkId?.id || null,
            status: OrderStatus.CONFIRMED,
            paymentStatus: PaymentStatus.SUCCESS,
            paidAt: new Date(),
          },
        });

        // 9. Transactional Outbox Job for async fulfillment
        await tx.outboxJob.create({
          data: {
            jobType: 'POST_PAYMENT_ORDER_FULFILLMENT',
            aggregateId: currentOrder.id,
            payload: {
              orderId: currentOrder.id,
              userId: user.id,
              networkId: createdNetworkId?.id,
              amountPaise: Number(currentOrder.totalAmountPaise),
            },
          },
        });

        // 10. Audit Log
        await tx.auditLog.create({
          data: {
            actorUserId: user.id,
            action: 'ORDER_FINALIZED_PAID',
            entityType: 'ORDER',
            entityId: currentOrder.id,
            metadata: {
              orderNumber: currentOrder.orderNumber,
              networkPublicId: createdNetworkId?.publicId,
            },
          },
        });

        return {
          alreadyFinalized: false,
          order: updatedOrder,
          user,
          networkId: createdNetworkId,
        };
      },
      {
        maxWait: 15000,
        timeout: 30000,
      }
    );

    logger.info('Order finalization successfully executed', {
      meta: {
        orderId,
        orderNumber: result.order.orderNumber,
        userId: result.user?.id,
        networkId: result.networkId?.id,
      },
    });

    return {
      finalized: true,
      alreadyFinalized: result.alreadyFinalized,
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
      status: result.order.status,
      customer: result.user
        ? {
            id: result.user.id,
            fullName: result.user.fullName,
            phone: result.user.phoneE164,
          }
        : null,
      network: result.networkId
        ? {
            id: result.networkId.id,
            publicId: result.networkId.publicId,
            referralCode: result.networkId.referralCode,
            depth: result.networkId.placementDepth,
          }
        : null,
    };
  }

  /**
   * Alias for backward compatibility
   */
  static async finalizePaidRegistration(orderId: string) {
    return this.finalizePaidOrder(orderId);
  }
}
