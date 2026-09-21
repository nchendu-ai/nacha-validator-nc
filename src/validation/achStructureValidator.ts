import { ValidationIssue } from './validationTypes';

export function validateAchStructure(lines: string[]): ValidationIssue[] {
	const issues: ValidationIssue[] = [];
	let inBatch = false;
	let hasEntry = false;
	let seenFileControl = false;
	if (lines[0]?.charAt(0) !== '1') { issues.push(issue(1, 'File must start with a File Header (record type 1).')); }
	for (let i = 0; i < lines.length; i++) {
		const type = lines[i].charAt(0);
		if (seenFileControl && type !== '9') { issues.push(issue(i + 1, 'Only padding records may follow the File Control record.')); }
		if (type === '5') {
			if (inBatch) { issues.push(issue(i + 1, 'Batch Header encountered before the preceding batch was closed.')); }
			inBatch = true; hasEntry = false;
		} else if (type === '6') {
			if (!inBatch) { issues.push(issue(i + 1, 'Entry Detail record occurs outside a batch.')); }
			hasEntry = true;
		} else if (type === '7') {
			if (!inBatch || !hasEntry) { issues.push(issue(i + 1, 'Addenda record must follow an Entry Detail record inside a batch.')); }
		} else if (type === '8') {
			if (!inBatch) { issues.push(issue(i + 1, 'Batch Control record appears without a Batch Header.')); }
			inBatch = false; hasEntry = false;
		} else if (type === '9' && !seenFileControl && !/^9+$/.test(lines[i])) {
			if (inBatch) { issues.push(issue(i + 1, 'File Control record occurs before the final batch is closed.')); }
			seenFileControl = true;
		}
	}
	if (inBatch) { issues.push(issue(lines.length, 'File ends before the current batch is closed.')); }
	if (!seenFileControl) { issues.push(issue(lines.length, 'File Control record is missing.')); }
	return issues;
}

function issue(lineNumber: number, message: string): ValidationIssue {
	return { severity: 'error', lineNumber, message };
}
