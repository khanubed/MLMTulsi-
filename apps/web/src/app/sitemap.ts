import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tulsiswarojgar.in';

  const routes = [
    '',
    '/products/tulsi-meta-ved-herbal-mix',
    '/about',
    '/contact',
    '/shipping-policy',
    '/returns-refunds',
    '/privacy-policy',
    '/terms',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' || route.startsWith('/products') ? 'weekly' : 'monthly',
    priority: route === '' ? 1.0 : route.startsWith('/products') ? 0.9 : 0.6,
  }));
}
