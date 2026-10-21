import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/dashboard/*', '/checkout', '/order-confirmation/*'],
      },
    ],
    sitemap: 'https://tulsiswaraj.com/sitemap.xml',
  };
}
