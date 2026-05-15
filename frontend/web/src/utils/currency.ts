/**
 * Currency formatting utilities for the application
 * Default currency is set to South African Rand (ZAR)
 */

/**
 * Format a number as South African Rand (ZAR)
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export const formatZAR = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a number as currency based on the provided currency code
 * @param amount The amount to format
 * @param currency The currency code (default: ZAR)
 * @param locale The locale to use for formatting (default: en-ZA)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'ZAR',
  locale: string = 'en-ZA'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Get the currency symbol for a given currency code
 * @param currency The currency code (default: ZAR)
 * @returns The currency symbol
 */
export const getCurrencySymbol = (currency: string = 'ZAR'): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(0)
    .replace(/[0-9]/g, '')
    .trim();
}; 