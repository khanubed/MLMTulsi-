import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { formatErrorResponse, NotFoundError } from '@/lib/errors';
import { FLAGSHIP_PRODUCT } from '@/data/productData';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Check DB first, fallback to flagship
    let product = await prisma.product.findUnique({
      where: { slug },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!product && slug === FLAGSHIP_PRODUCT.slug) {
      return NextResponse.json({
        success: true,
        data: {
          id: 'flagship-product-id',
          name: FLAGSHIP_PRODUCT.name,
          slug: FLAGSHIP_PRODUCT.slug,
          sku: 'META-VED-001',
          description: FLAGSHIP_PRODUCT.description,
          pricePaise: 50000,
          displayPrice: FLAGSHIP_PRODUCT.price,
          currency: 'INR',
          isActive: true,
          images: FLAGSHIP_PRODUCT.images,
        },
      });
    }

    if (!product) {
      throw new NotFoundError(`Product "${slug}" not found`);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        pricePaise: Number(product.pricePaise),
        displayPrice: Number(product.pricePaise) / 100,
        currency: product.currency,
        isActive: product.isActive,
        images: product.images,
      },
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
