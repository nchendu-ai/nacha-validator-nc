import * as vscode from 'vscode';
import { validateRecordLength } from '../validation/recordLengthValidator';
import { validateAchStructure } from '../validation/achStructureValidator';
import { validateAchFields } from '../validation/achFieldValidator';
import { analyzeAchFile } from '../analysis/achFileAnalyzer';
import { showValidationResults } from '../ui/validationResults';

export function validateNachaCommand(
	context: vscode.ExtensionContext
): void {

	const editor = vscode.window.activeTextEditor;

	if (!editor) {
		vscode.window.showWarningMessage(
			'Please open a NACHA file first.'
		);

		return;
	}

	const document = editor.document;

	const lines: string[] = [];

	for (let i = 0; i < document.lineCount; i++) {
		lines.push(document.lineAt(i).text);
	}

	const validationResult = validateRecordLength(lines);
	const analysis = analyzeAchFile(lines);
	const structureIssues = validateAchStructure(lines);
	const fieldIssues = validateAchFields(lines);
	const controlIssues = [
		...analysis.batches.flatMap(batch => batch.controlComparisons
			.filter(comparison => !comparison.passed)
			.map(comparison => ({ severity: 'error' as const, context: `Batch ${batch.batchNumber || '(unknown)'}`, message: `${comparison.label} mismatch.`, expected: comparison.calculated, actual: comparison.declared }))
		),
		...analysis.fileControlComparisons
			.filter(comparison => !comparison.passed)
			.map(comparison => ({ severity: 'error' as const, context: 'File Control', message: `${comparison.label} mismatch.`, expected: comparison.calculated, actual: comparison.declared }))
	];

	showValidationResults(
		context,
		document.fileName,
		validationResult,
		analysis,
		[...structureIssues, ...fieldIssues, ...controlIssues]
	);
}
