import * as vscode from 'vscode';
import { ValidationResult } from '../validation/validationTypes';

export function showValidationResults(
	context: vscode.ExtensionContext,
	fileName: string,
	result: ValidationResult
): void {

	const panel = vscode.window.createWebviewPanel(
		'nachaValidationResults',
		'NACHA Validation Results',
		vscode.ViewColumn.Beside,
		{
			enableScripts: false
		}
	);

	const cssUri = panel.webview.asWebviewUri(
		vscode.Uri.joinPath(
			context.extensionUri,
			'media',
			'validation.css'
		)
	);

	const fileNameOnly = fileName.split('/').pop() || fileName;

	const isValid = result.errors.length === 0;

	const errorRows = result.errors.map(error => `
		<tr>
			<td class="line-number">${error.lineNumber}</td>
			<td>${error.expected}</td>
			<td class="actual-length">${error.actual}</td>
			<td>
				<span class="status-badge">Invalid</span>
			</td>
		</tr>
	`).join('');

	panel.webview.html = `
		<!DOCTYPE html>

		<html lang="en">

		<head>
			<meta charset="UTF-8">

			<meta
				http-equiv="Content-Security-Policy"
				content="default-src 'none'; style-src ${panel.webview.cspSource};"
			>

			<link
				rel="stylesheet"
				href="${cssUri}"
			>

			<title>NACHA Validation Results</title>
		</head>

		<body>

			<div class="container">

				<div class="header">

					<div class="title">
						NACHA Validation
					</div>

					<div class="file-name">
						${escapeHtml(fileNameOnly)}
					</div>

				</div>

				${isValid
					? createSuccessSection(result)
					: createFailureSection(result, errorRows)
				}

				<div class="footer">
					NACHA Validator • Record length validation
				</div>

			</div>

		</body>

		</html>
	`;
}

function createSuccessSection(
	result: ValidationResult
): string {

	return `
		<div class="result-card success">

			<div class="result-icon">
				✓
			</div>

			<div class="result-title">
				Validation Passed
			</div>

			<div class="result-message">
				All records contain exactly 94 characters.
			</div>

			<div class="stats">

				<div class="stat">
					<span class="stat-number">
						${result.totalRecords}
					</span>

					<span class="stat-label">
						Records checked
					</span>
				</div>

				<div class="stat">
					<span class="stat-number">
						0
					</span>

					<span class="stat-label">
						Invalid records
					</span>
				</div>

			</div>

		</div>
	`;
}

function createFailureSection(
	result: ValidationResult,
	errorRows: string
): string {

	return `
		<div class="result-card failure">

			<div class="result-icon">
				!
			</div>

			<div class="result-title">
				Validation Failed
			</div>

			<div class="result-message">
				${result.errors.length}
				record${result.errors.length === 1 ? '' : 's'}
				do not contain exactly 94 characters.
			</div>

			<div class="stats">

				<div class="stat">
					<span class="stat-number">
						${result.totalRecords}
					</span>

					<span class="stat-label">
						Records checked
					</span>
				</div>

				<div class="stat">
					<span class="stat-number">
						${result.errors.length}
					</span>

					<span class="stat-label">
						Invalid records
					</span>
				</div>

			</div>

		</div>

		<div class="section-title">
			Invalid Records
		</div>

		<table>

			<thead>
				<tr>
					<th>Line</th>
					<th>Expected</th>
					<th>Actual</th>
					<th>Status</th>
				</tr>
			</thead>

			<tbody>
				${errorRows}
			</tbody>

		</table>
	`;
}

function escapeHtml(value: string): string {

	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}
