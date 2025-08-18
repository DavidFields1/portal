import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Formatea un número como moneda según el locale y la moneda especificada
 * @param amount - Cantidad a formatear
 * @param currency - Código de moneda (ej: 'MXN', 'USD', 'EUR')
 * @param locale - Locale para el formateo (por defecto 'es-MX')
 * @returns String formateado como moneda
 */
export function formatCurrency(amount: number, currency: string, locale: string = 'es-MX'): string {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
}

/**
 * Formatea un número como moneda sin el símbolo de moneda
 * @param amount - Cantidad a formatear
 * @param locale - Locale para el formateo (por defecto 'es-MX')
 * @returns String formateado como número con separadores de miles
 */
export function formatNumber(amount: number, locale: string = 'es-MX'): string {
	return new Intl.NumberFormat(locale, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
}
