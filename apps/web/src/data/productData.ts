import type { Product } from '../types/product';

export const FLAGSHIP_PRODUCT: Product = {
  id: 'tulsi-meta-ved-01',
  slug: 'tulsi-meta-ved-herbal-mix',
  name: 'Tulsi Meta Ved Herbal Mix',
  subtitle: 'A thoughtful botanical daily wellness preparation',
  price: 500,
  currency: 'INR',
  description: 'Tulsi Meta Ved Herbal Mix is our signature botanical blend rooted in centuries of Indian Ayurvedic reverence. Crafted to integrate harmoniously into your daily morning or evening rituals, this herbal preparation presents natural botanical warmth in an unadulterated form.',
  badge: 'Flagship Formulation',
  formulationStatus: 'Verified Natural Blend (Final lab batch details pending verification)',
  images: [
    {
      id: 'img-1',
      url: '/images/product_primary.jpg',
      alt: 'Tulsi Meta Ved Herbal Mix ceramic jar and tulsi leaves',
      caption: 'Front product presentation'
    },
    {
      id: 'img-2',
      url: '/images/product_lifestyle.jpg',
      alt: 'Tulsi Meta Ved jar on wooden table with herbal tea infusion',
      caption: 'Morning ritual lifestyle composition'
    },
    {
      id: 'img-3',
      url: '/images/hero_botanical.jpg',
      alt: 'Product on limestone pedestal with organic botanical foliage',
      caption: 'Studio pedestal view'
    },
    {
      id: 'img-4',
      url: '/images/botanical_ingredients.jpg',
      alt: 'Botanical ingredients flat lay on handmade paper',
      caption: 'Botanical sourcing preview'
    }
  ],
  specifications: [
    { label: 'Selling Price', value: '₹500 (Inclusive of applicable taxes)' },
    { label: 'Form', value: 'Fine Herbal Mix Powder' },
    { label: 'Net Weight', value: '100g (Pending final batch confirmation)', isPlaceholder: true },
    { label: 'Origin', value: 'Sourced & Made in India' },
    { label: 'Shelf Life', value: '12 Months from packaging (Pending batch stamp)', isPlaceholder: true },
    { label: 'Storage', value: 'Store in a cool, dry place away from direct sunlight' }
  ],
  ingredientsListStatus: 'pending',
  verifiedIngredients: [
    'Ocimum Sanctum (Krishna Tulsi)',
    'Ocimum Gratissimum (Rama Tulsi)',
    'Zingiber Officinale (Dry Ginger - pending lab ratio)',
    'Traditional botanical synergy base (Exact percentages pending business certificate)'
  ],
  usageInstructions: [
    {
      step: 1,
      title: 'Warm Infusion',
      description: 'Take half a teaspoon of Tulsi Meta Ved Herbal Mix in a cup of freshly boiled warm water or milk.'
    },
    {
      step: 2,
      title: 'Stir & Rest',
      description: 'Stir well and let the herbs steep gently for 2 to 3 minutes to awaken the botanical oils.'
    },
    {
      step: 3,
      title: 'Mindful Sip',
      description: 'Enjoy warm as part of your morning mindfulness or evening wind-down routine.'
    }
  ]
};
