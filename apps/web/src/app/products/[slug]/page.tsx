import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FLAGSHIP_PRODUCT } from '@/data/productData';
import { ProductDetailClient } from '@/components/product/ProductDetailClient';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return [
    { slug: 'tulsi-meta-ved-herbal-mix' },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== 'tulsi-meta-ved-herbal-mix') {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${FLAGSHIP_PRODUCT.name} — Pure Botanical Ayurvedic Mix (₹${FLAGSHIP_PRODUCT.price})`,
    description: FLAGSHIP_PRODUCT.description,
    openGraph: {
      title: `${FLAGSHIP_PRODUCT.name} | Tulsi Swaraj`,
      description: FLAGSHIP_PRODUCT.description,
      url: `https://tulsiswaraj.com/products/${slug}`,
      images: [
        {
          url: FLAGSHIP_PRODUCT.images[0].url,
          width: 800,
          height: 800,
          alt: FLAGSHIP_PRODUCT.name,
        },
      ],
    },
    alternates: {
      canonical: `/products/${slug}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  if (slug !== 'tulsi-meta-ved-herbal-mix') {
    notFound();
  }

  const jsonLdProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: FLAGSHIP_PRODUCT.name,
    image: FLAGSHIP_PRODUCT.images.map((img) => `https://tulsiswaraj.com${img.url}`),
    description: FLAGSHIP_PRODUCT.description,
    sku: FLAGSHIP_PRODUCT.id,
    mpn: 'TS-MVHM-001',
    brand: {
      '@type': 'Brand',
      name: 'Tulsi Swaraj',
    },
    offers: {
      '@type': 'Offer',
      url: `https://tulsiswaraj.com/products/${slug}`,
      priceCurrency: 'INR',
      price: FLAGSHIP_PRODUCT.price.toString(),
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Tulsi Swarojgar Pvt. Limited',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '128',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
      />
      <ProductDetailClient />
    </>
  );
}
