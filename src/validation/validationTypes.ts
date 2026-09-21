export interface ValidationError {
	lineNumber: number;
	expected: number;
	actual: number;
}

export interface ValidationResult {
	totalRecords: number;
	errors: ValidationError[];
}
