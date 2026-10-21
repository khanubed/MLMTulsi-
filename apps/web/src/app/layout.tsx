import type { Metadata, Viewport } from 'next';
import { Manrope, DM_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const viewport: Viewport = {
  themeColor: '#183F32',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://tulsiswaraj.com'),
  title: {
    default: 'Tulsi Swaraj | Premium Ayurvedic Wellness',
    template: '%s | Tulsi Swaraj',
  },
  description:
    'Experience pure Ayurvedic wellness with Tulsi Swaraj. Traditional botanical formulations harmonized by nature and crafted to wholeness.',
  keywords: [
    'Tulsi Swaraj',
    'Ayurveda',
    'Herbal Mix',
    'Botanical Wellness',
    'Natural Health',
    'Tulsi Meta Ved',
  ],
  authors: [{ name: 'Tulsi Swaraj' }],
  creator: 'Tulsi Swaraj',
  publisher: 'Tulsi Swarojgar Pvt. Limited',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://tulsiswaraj.com',
    siteName: 'Tulsi Swaraj',
    title: 'Tulsi Swaraj | Premium Ayurvedic Wellness',
    description:
      'Experience pure Ayurvedic wellness with Tulsi Swaraj. Traditional botanical formulations harmonized by nature.',
    images: [
      {
        url: '/images/product_primary.png',
        width: 1200,
        height: 630,
        alt: 'Tulsi Meta Ved Herbal Mix',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tulsi Swaraj | Premium Ayurvedic Wellness',
    description: 'Traditional botanical formulations harmonized by nature.',
    images: ['/images/product_primary.png'],
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdOrg = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tulsi Swarojgar Pvt. Limited',
    alternateName: 'Tulsi Swaraj',
    url: 'https://tulsiswaraj.com',
    logo: 'https://tulsiswaraj.com/images/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-8049208000',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
    },
    sameAs: ['https://tulsiswaraj.com'],
  };

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${dmSans.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body className="min-h-screen bg-[#F8F5ED] text-[#252923] antialiased selection:bg-[#B49A63]/30 selection:text-[#183F32] flex flex-col font-sans">
        <SmoothScrollProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
          <CartDrawer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
