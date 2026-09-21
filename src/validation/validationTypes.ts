export interface ValidationError {
	lineNumber: number;
	expected: number;
	actual: number;
}

export interface ValidationResult {
	totalRecords: number;
	errors: ValidationError[];
}

export interface ValidationIssue {
	severity: 'error' | 'warning';
	lineNumber?: number;
	message: string;
	context?: string;
	expected?: string | number;
	actual?: string | number;
}
