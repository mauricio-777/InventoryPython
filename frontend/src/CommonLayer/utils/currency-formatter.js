/**
 * Currency formatting utilities for the frontend.
 *
 * @param {number} amount      - numeric value
 * @param {string} [currency='S/'] - currency prefix
 * @param {number} [decimals=2]    - decimal places
 * @returns {string} formatted string, e.g. "S/ 1,234.50"
 *
 * Usage
 * ─────
 * import { formatCurrency, formatCurrencyUSD } from '../utils/currency-formatter.js';
 * formatCurrency(1234.5)        // "S/ 1,234.50"
 * formatCurrencyUSD(99.9)       // "USD 99.90"
 */

export const formatCurrency = (amount, currency = 'S/', decimals = 2) => {
    if (amount == null || isNaN(amount)) return `${currency} 0.00`;
    const num = parseFloat(amount);
    return `${currency} ${num.toLocaleString('es-PE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    })}`;
};

export const formatCurrencyUSD = (amount, decimals = 2) =>
    formatCurrency(amount, 'USD', decimals);

/**
 * Parse a formatted currency string back to a float.
 * e.g. "S/ 1,234.50" → 1234.5
 */
export const parseCurrency = (str) => {
    if (!str) return 0;
    const cleaned = String(str).replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
};

/**
 * Calculate IGV (18%) and return { igv, total }.
 */
export const calcularIGV = (subtotal, tasa = 0.18) => {
    const igv = Math.round(subtotal * tasa * 100) / 100;
    const total = Math.round((subtotal + igv) * 100) / 100;
    return { igv, total };
};
