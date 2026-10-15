export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
  isPlaceholder?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  price: number; // ₹500 as per SOP
  currency: string;
  description: string;
  images: ProductImage[];
  badge?: string;
  formulationStatus: string;
  specifications: ProductSpec[];
  ingredientsListStatus: 'verified' | 'pending';
  verifiedIngredients: string[];
  usageInstructions: {
    step: number;
    title: string;
    description: string;
  }[];
}
