import { NextRequest, NextResponse } from 'next/server';
import { formatErrorResponse } from '@/lib/errors';
import { validateJsonBody } from '@/lib/validation';
import { CustomerDetailsSchema } from '@/lib/validations/checkout';
import { CheckoutService } from '@/modules/checkout/checkout.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validatedBody = await validateJsonBody(request, CustomerDetailsSchema);
    const updated = await CheckoutService.updateCustomerDetails(id, validatedBody);

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
        customerName: updated.customerName,
        customerPhone: updated.customerPhone,
        customerEmail: updated.customerEmail,
        shippingAddress: updated.shippingAddress,
      },
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
