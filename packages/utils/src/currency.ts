/**
 * Format paise into formatted INR string (e.g. 50000 -> ₹500 or ₹500.00)
 */
export function formatPaiseToInr(paise: number | bigint, includeDecimals = false): string {
  const numericPaise = typeof paise === 'bigint' ? Number(paise) : paise;
  const rupees = numericPaise / 100;
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Convert rupee amount to integer paise (e.g. 500 -> 50000)
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
