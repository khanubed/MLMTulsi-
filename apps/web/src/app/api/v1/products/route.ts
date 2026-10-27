import { NextResponse } from 'next/server';
import { formatErrorResponse } from '@/lib/errors';
import { ProductsService } from '@/modules/products/products.service';

export async function GET() {
  try {
    const products = await ProductsService.listProducts();
    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
