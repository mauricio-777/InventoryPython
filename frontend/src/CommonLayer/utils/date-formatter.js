/**
 * Date formatting utilities for the frontend.
 *
 * All functions accept: ISO strings, Date objects, or null/undefined.
 * Returns '—' when the input is falsy.
 *
 * Usage
 * ─────
 * import { formatDate, formatDateTime, isExpired, daysUntilExpiry } from '../utils/date-formatter.js';
 * formatDate('2026-03-03')              // "03/03/2026"
 * formatDateTime('2026-03-03T14:30:00') // "03/03/2026 14:30"
 * isExpired('2025-01-01')              // true
 */

const FALLBACK = '—';

function toDate(value) {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    return isNaN(d.getTime()) ? null : d;
}

/**
 * Format a date as "dd/mm/yyyy".
 */
export const formatDate = (value) => {
    const d = toDate(value);
    if (!d) return FALLBACK;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};

/**
 * Format a datetime as "dd/mm/yyyy HH:MM".
 */
export const formatDateTime = (value) => {
    const d = toDate(value);
    if (!d) return FALLBACK;
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${formatDate(d)} ${hh}:${min}`;
};

/**
 * Returns true if the date is in the past (expired).
 */
export const isExpired = (value) => {
    const d = toDate(value);
    if (!d) return false;
    return d < new Date();
};

/**
 * Returns the number of days until the given date (negative = already expired).
 */
export const daysUntilExpiry = (value) => {
    const d = toDate(value);
    if (!d) return null;
    const diffMs = d.getTime() - Date.now();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Returns a human-readable relative label, e.g. "Vence en 5 días", "Vencido hace 2 días".
 */
export const expiryLabel = (value) => {
    const days = daysUntilExpiry(value);
    if (days === null) return FALLBACK;
    if (days === 0) return 'Vence hoy';
    if (days > 0) return `Vence en ${days} día${days !== 1 ? 's' : ''}`;
    return `Vencido hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? 's' : ''}`;
};
