import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('NACHA Validator extension is now active.');

	const disposable = vscode.commands.registerCommand(
		'nacha-validator-nc.helloWorld',
		() => {

			// Get the file currently open in the VS Code editor
			const editor = vscode.window.activeTextEditor;

			if (!editor) {
				vscode.window.showWarningMessage(
					'Please open a NACHA file first.',
					{ modal: true }
				);
				return;
			}

			// Read the file
			const document = editor.document;

			// Check every line
			const errors: string[] = [];

			for (let i = 0; i < document.lineCount; i++) {

				const line = document.lineAt(i).text;
				const actualLength = line.length;

				if (actualLength !== 94) {
					errors.push(
						`Line ${i + 1}: expected 94 characters, found ${actualLength}`
					);
				}
			}

			// Show validation result
			if (errors.length === 0) {

				vscode.window.showInformationMessage(
					`NACHA Validation Passed: ${document.lineCount} records are 94 characters.`,
					{ modal: true }
				);

			} else {

				vscode.window.showErrorMessage(
					`NACHA Validation Failed: ${errors.length} invalid record(s).`,
					{ modal: true }
				);

				// Print detailed errors to the Debug Console
				for (const error of errors) {
					console.log(error);
				}
			}
		}
	);

	context.subscriptions.push(disposable);
}

export function deactivate() {}