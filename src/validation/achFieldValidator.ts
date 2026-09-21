import { ValidationIssue } from './validationTypes';

const KNOWN_SEC_CODES = new Set(['ARC', 'BOC', 'CCD', 'CIE', 'CTX', 'IAT', 'POP', 'POS', 'PPD', 'RCK', 'TEL', 'WEB']);
const SINGLE_ADDENDA_SEC_CODES = new Set(['PPD', 'CCD', 'WEB']);

/** Validates common field-level invariants; it intentionally is not a complete Rules engine. */
export function validateAchFields(lines: string[]): ValidationIssue[] {
	const issues: ValidationIssue[] = [];
	let secCode = '';
	let odfi = '';
	let lastEntryLine: number | undefined;
	let lastEntryAddenda = 0;
	let previousTrace = '';

	for (let index = 0; index < lines.length; index++) {
		const line = lines[index];
		const lineNumber = index + 1;
		switch (line.charAt(0)) {
			case '1':
				fixed(issues, line, lineNumber, 2, 3, '01', 'Priority Code');
				fixed(issues, line, lineNumber, 35, 37, '094', 'Record Size');
				fixed(issues, line, lineNumber, 38, 39, '10', 'Blocking Factor');
				fixed(issues, line, lineNumber, 40, 40, '1', 'Format Code');
				break;
			case '5':
				secCode = slice(line, 51, 53);
				odfi = slice(line, 80, 87);
				previousTrace = '';
				if (!KNOWN_SEC_CODES.has(secCode)) { issues.push(warning(lineNumber, `Unrecognized SEC code "${secCode || '(blank)'}"; no SEC-specific validation was applied.`)); }
				break;
			case '6': {
				lastEntryLine = lineNumber;
				lastEntryAddenda = 0;
				const routing = slice(line, 4, 12);
				if (!validAbaRouting(routing)) { issues.push(error(lineNumber, 'Receiving DFI routing number has an invalid ABA check digit.')); }
				const trace = slice(line, 80, 94);
				if (odfi && trace && !trace.startsWith(odfi)) { issues.push(error(lineNumber, 'Trace number does not begin with the Batch Header ODFI Identification.', `ODFI prefix ${odfi}`, trace.slice(0, 8))); }
				if (previousTrace && trace && trace <= previousTrace) { issues.push(warning(lineNumber, 'Trace number is not in ascending order within the batch.')); }
				previousTrace = trace;
				break;
			}
			case '7':
				lastEntryAddenda++;
				if (slice(line, 2, 3) !== '05') { issues.push(warning(lineNumber, 'Addenda Type Code is not 05; this validator only applies common PPD/CCD/WEB addenda rules.')); }
				if (slice(line, 84, 87) !== String(lastEntryAddenda).padStart(4, '0')) { issues.push(error(lineNumber, 'Addenda sequence number does not match its position after the entry.')); }
				if (lastEntryLine && SINGLE_ADDENDA_SEC_CODES.has(secCode) && lastEntryAddenda > 1) { issues.push(error(lineNumber, `${secCode} entries support at most one addenda record.`)); }
				if (secCode === 'TEL') { issues.push(error(lineNumber, 'TEL entries do not allow addenda records.')); }
				break;
			case '8':
				if (odfi && slice(line, 80, 87) !== odfi) { issues.push(error(lineNumber, 'Batch Control ODFI Identification does not match the Batch Header.', odfi, slice(line, 80, 87))); }
				break;
		}
	}
	return issues;
}

function slice(line: string, start: number, end: number): string { return line.slice(start - 1, end).trim(); }
function fixed(issues: ValidationIssue[], line: string, lineNumber: number, start: number, end: number, expected: string, label: string): void {
	const actual = slice(line, start, end);
	if (actual !== expected) { issues.push(error(lineNumber, `${label} must be ${expected}.`, expected, actual || '(blank)')); }
}
function validAbaRouting(value: string): boolean {
	if (!/^\d{9}$/.test(value)) { return false; }
	const digits = [...value].map(Number);
	return (3 * (digits[0] + digits[3] + digits[6]) + 7 * (digits[1] + digits[4] + digits[7]) + digits[2] + digits[5] + digits[8]) % 10 === 0;
}
function error(lineNumber: number, message: string, expected?: string, actual?: string): ValidationIssue { return { severity: 'error', lineNumber, message, expected, actual }; }
function warning(lineNumber: number, message: string): ValidationIssue { return { severity: 'warning', lineNumber, message }; }
