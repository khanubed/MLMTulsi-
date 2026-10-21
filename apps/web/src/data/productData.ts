import type { Product } from '../types/product';

export const FLAGSHIP_PRODUCT: Product = {
  id: 'tulsi-meta-ved-01',
  slug: 'tulsi-meta-ved-herbal-mix',
  name: 'Tulsi Meta Ved Herbal Mix',
  subtitle: 'A thoughtful botanical daily wellness preparation',
  price: 500 ,
  currency: 'INR',
  description: 'Tulsi Meta Ved Herbal Mix is our signature botanical blend rooted in centuries of Indian Ayurvedic reverence. Crafted to integrate harmoniously into your daily morning or evening rituals, this herbal preparation presents natural botanical warmth in an unadulterated form.',
  badge: 'Flagship Formulation',
  formulationStatus: 'Verified Natural Blend (Final lab batch details pending verification)',
  images: [
    {
      id: 'img-1',
      url: '/images/product_primary.png',
      alt: 'Tulsi Meta Ved Herbal Mix bottle presentation',
      caption: 'Front product presentation'
    },
    {
      id: 'img-back',
      url: '/images/product_back.png',
      alt: 'Tulsi Meta Ved Herbal Mix back label showing ingredients, dose, and directions for use',
      caption: 'Back label: Ingredients, Dose & Directions'
    },
    {
      id: 'img-2',
      url: '/images/product_lifestyle.png',
      alt: 'Tulsi Meta Ved jar on wooden table with herbal tea infusion',
      caption: 'Morning ritual lifestyle composition'
    },
    {
      id: 'img-3',
      url: '/images/hero_botanical.png',
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
    { label: 'Selling Price', value: '₹500 (Flat 50% Launch Discount applied)' },
    { label: 'Maximum Retail Price (M.R.P.)', value: '₹999 (Inclusive of all taxes)' },
    { label: 'Form', value: 'Fine Herbal Mix Powder' },
    { label: 'Net Weight', value: '100g (Verified bottle packaging)' },
    { label: 'Origin', value: 'Sourced & Made in India' },
    { label: 'Shelf Life', value: '12 Months from packaging (See bottle base for batch stamp)' },
    { label: 'Storage', value: 'Store in a cool, dry place away from direct sunlight. Keep out of reach of children.' }
  ],
  ingredientsListStatus: 'verified',
  verifiedIngredients: [
    'Ginger powder (Sonth)',
    'Fenugreek (Methi)',
    'Dill (Sowa)',
    'Ajwain (Carom seeds)',
    'Tulsi Powder (Holy Basil)',
    'Cumin (Jeera)',
    'Black Pepper (Kali Mirch)'
  ],
  usageInstructions: [
    {
      step: 1,
      title: 'Dose & Timing',
      description: 'Take 1 to 2 teaspoons in the morning and evening, or as directed by your healthcare worker.'
    },
    {
      step: 2,
      title: 'Warm Preparation',
      description: 'Mix with warm water, milk, or prepare as a decoction according to your body condition.'
    },
    {
      step: 3,
      title: 'Precaution',
      description: 'Do not consume during pregnancy. Keep out of reach of children. (गर्भावस्था के दौरान इस उत्पाद का सेवन न करें।)'
    }
  ]
};
