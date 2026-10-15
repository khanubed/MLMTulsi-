export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'product' | 'order' | 'shipping';
  isPendingVerification?: boolean;
}

export const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'product',
    question: 'What is Tulsi Meta Ved Herbal Mix?',
    answer: 'Tulsi Meta Ved Herbal Mix is our flagship herbal preparation crafted around reverent Indian botanical traditions. It is designed to be an accessible, pure botanical addition to your everyday wellness rituals.'
  },
  {
    id: 'faq-2',
    category: 'product',
    question: 'What are its ingredients?',
    answer: 'The primary botanical components are Krishna Tulsi and Rama Tulsi, supported by traditional warming herbs. Note: As per our transparency standards, the complete lab-certified ingredient percentages will be displayed upon final batch release.',
    isPendingVerification: true
  },
  {
    id: 'faq-3',
    category: 'product',
    question: 'How should it be used?',
    answer: 'Mix half a teaspoon with warm water, herbal decoction, or warm milk once or twice daily. Allow the blend to steep for 2-3 minutes before sipping. Please consult a qualified Ayurvedic physician if you are pregnant, nursing, or undergoing medical care.'
  },
  {
    id: 'faq-4',
    category: 'order',
    question: 'What is the price?',
    answer: 'Tulsi Meta Ved Herbal Mix is offered at an introductory single-unit price of ₹500, inclusive of all applicable domestic taxes.'
  },
  {
    id: 'faq-5',
    category: 'order',
    question: 'How can an order be placed?',
    answer: 'You can easily order directly through this website by clicking "Buy Now" or "Add to Cart" and completing our straightforward checkout form with simulated payment verification.'
  },
  {
    id: 'faq-6',
    category: 'shipping',
    question: 'What are the shipping and return policies?',
    answer: 'We provide delivery across India with standard dispatch within 24-48 business hours. Products in undamaged, unopened condition are eligible for our return protocol within 7 days of delivery. Refer to our dedicated Shipping and Return Policy pages for details.'
  },
  {
    id: 'faq-7',
    category: 'shipping',
    question: 'How can customer support be contacted?',
    answer: 'Our customer support team is available Monday through Saturday (9:00 AM – 6:00 PM IST) via our on-site Support Desk, email at support@tulsiswaraj.example.in, or through your authenticated account dashboard.'
  }
];
