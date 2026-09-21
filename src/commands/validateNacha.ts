import * as vscode from 'vscode';
import { validateRecordLength } from '../validation/recordLengthValidator';
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

	showValidationResults(
		context,
		document.fileName,
		validationResult
	);
}
