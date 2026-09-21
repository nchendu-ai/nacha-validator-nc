/** ACH monetary fields are stored as whole cents. */
export function parseAchAmount(value: string): number {
	const normalized = value.trim();
	return /^\d+$/.test(normalized) ? Number.parseInt(normalized, 10) : 0;
}

export function formatAchAmount(cents: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format(cents / 100);
}
