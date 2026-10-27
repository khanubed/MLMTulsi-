import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { PaymentsService } from '@/modules/payments/payments.service';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-verify');
    const rawBody = await request.json();

    const isValid = await PaymentsService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      logger.warn('PhonePe webhook signature verification failed');
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
    }

    logger.info('PhonePe payment event webhook received and authenticated', {
      meta: { response: rawBody.response ? 'present' : 'empty' },
    });

    return NextResponse.json({
      success: true,
      message: 'Webhook processed',
    });
  } catch (error) {
    logger.error('Error processing PhonePe webhook', { error });
    return NextResponse.json({ success: false, message: 'Processing error' }, { status: 500 });
  }
}
