import { ValidationResult } from './validationTypes';

const NACHA_RECORD_LENGTH = 94;

export function validateRecordLength(
	lines: string[]
): ValidationResult {

	const errors = [];

	for (let i = 0; i < lines.length; i++) {

		const actualLength = lines[i].length;

		if (actualLength !== NACHA_RECORD_LENGTH) {
			errors.push({
				lineNumber: i + 1,
				expected: NACHA_RECORD_LENGTH,
				actual: actualLength
			});
		}
	}

	return {
		totalRecords: lines.length,
		errors
	};
}
