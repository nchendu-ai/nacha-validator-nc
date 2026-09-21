import * as vscode from 'vscode';
import { AchBatchAnalysis, AchFileAnalysis, ControlComparison } from '../analysis/achFileAnalyzer';
import { formatAchAmount } from '../analysis/achAmount';
import { ValidationIssue, ValidationResult } from '../validation/validationTypes';

export function showValidationResults(context: vscode.ExtensionContext, fileName: string, lengthResult: ValidationResult, analysis: AchFileAnalysis, issues: ValidationIssue[]): void {
	const panel = vscode.window.createWebviewPanel('nachaValidationResults', 'NACHA Validation Results', vscode.ViewColumn.Beside, { enableScripts: false });
	const cssUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'validation.css'));
	const allIssues = [...lengthResult.errors.map(error => ({ severity: 'error' as const, lineNumber: error.lineNumber, message: `Expected 94 characters, found ${error.actual}.`, expected: error.expected, actual: error.actual })), ...issues];
	const isValid = allIssues.every(issue => issue.severity !== 'error');
	const name = escapeHtml(fileName.split('/').pop() || fileName);
	panel.webview.html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${panel.webview.cspSource};"><link rel="stylesheet" href="${cssUri}"><title>NACHA Validation Results</title></head><body><main class="container"><header class="header"><div class="title">NACHA Validation</div><div class="file-name">${name}</div></header>${status(isValid, allIssues.length)}${summary(analysis)}${controls('File Control Reconciliation', analysis.fileControlComparisons)}${analysis.batches.map(batch).join('')}${entries(analysis)}${issueList(allIssues)}<footer class="footer">NACHA Validator • Structural and control-total validation; not full NACHA Operating Rules compliance.</footer></main></body></html>`;
}

function status(valid: boolean, issueCount: number): string {
	return `<section class="result-card ${valid ? 'success' : 'failure'}"><div class="result-icon">${valid ? '✓' : '!'}</div><div class="result-title">${valid ? 'VALID NACHA FILE' : 'INVALID NACHA FILE'}</div><div class="result-message">${valid ? 'Record length, structure, fields, and available control totals reconciled.' : `${issueCount} validation issue${issueCount === 1 ? '' : 's'} found.`}</div></section>`;
}

function summary(analysis: AchFileAnalysis): string {
	const gross = analysis.debitCents + analysis.creditCents;
	const net = analysis.creditCents - analysis.debitCents;
	return `<h2>File Summary</h2><section class="stats">${stat('Records', analysis.totalRecords)}${stat('Batches', analysis.batches.length)}${stat('Entries', analysis.entries.length)}${stat('Addenda', analysis.addendaCount)}${stat('Entry + Addenda', analysis.entries.length + analysis.addendaCount)}${stat('Debit', formatAchAmount(analysis.debitCents))}${stat('Credit', formatAchAmount(analysis.creditCents))}${stat('Gross', formatAchAmount(gross))}${stat('Net', formatAchAmount(net))}</section>`;
}

function stat(label: string, value: string | number): string { return `<div class="stat"><span class="stat-number">${value}</span><span class="stat-label">${label}</span></div>`; }

function controls(title: string, comparisons: ControlComparison[]): string {
	if (comparisons.length === 0) { return `<h2>${title}</h2><p class="muted">No File Control record was available for reconciliation.</p>`; }
	return `<h2>${title}</h2><table><thead><tr><th>Check</th><th>Calculated</th><th>Declared</th><th>Status</th></tr></thead><tbody>${comparisons.map(comparison => `<tr><td>${comparison.label}</td><td>${display(comparison.calculated, comparison.monetary)}</td><td>${display(comparison.declared, comparison.monetary)}</td><td><span class="status-badge ${comparison.passed ? 'pass' : 'fail'}">${comparison.passed ? 'PASS' : 'FAIL'}</span></td></tr>`).join('')}</tbody></table>`;
}

function batch(batch: AchBatchAnalysis): string {
	const gross = batch.debitCents + batch.creditCents;
	return `<details class="batch" open><summary>BATCH ${escapeHtml(batch.batchNumber || '(unknown)')} — ${escapeHtml(batch.companyName || 'Unnamed company')}</summary><div class="batch-content"><dl class="metadata"><dt>Company</dt><dd>${escapeHtml(batch.companyName)}</dd><dt>Company ID</dt><dd>${escapeHtml(batch.companyId)}</dd><dt>SEC</dt><dd>${escapeHtml(batch.secCode)}</dd><dt>Service Class</dt><dd>${escapeHtml(batch.serviceClass)}</dd><dt>Entry Description</dt><dd>${escapeHtml(batch.entryDescription)}</dd><dt>Effective Date</dt><dd>${escapeHtml(batch.effectiveEntryDate)}</dd></dl><section class="stats">${stat('Entries', batch.entries.length)}${stat('Addenda', batch.addendaCount)}${stat('Debit', formatAchAmount(batch.debitCents))}${stat('Credit', formatAchAmount(batch.creditCents))}${stat('Gross', formatAchAmount(gross))}${stat('Net', formatAchAmount(batch.creditCents - batch.debitCents))}</section>${controls('Batch Control Reconciliation', batch.controlComparisons)}</div></details>`;
}

function entries(analysis: AchFileAnalysis): string {
	return `<h2>Entries</h2>${analysis.entries.length === 0 ? '<p class="muted">No entries found.</p>' : `<div class="table-scroll"><table><thead><tr><th>Line</th><th>Trace</th><th>Transaction</th><th>Type</th><th>Amount</th><th>Receiving DFI</th><th>Account</th><th>Individual ID</th><th>Name</th><th>Addenda</th></tr></thead><tbody>${analysis.entries.map(entry => `<tr><td>${entry.lineNumber}</td><td>${escapeHtml(entry.traceNumber)}</td><td>${escapeHtml(entry.transactionCode)}</td><td>${entry.transactionType}</td><td>${formatAchAmount(entry.amountCents)}</td><td>${escapeHtml(entry.receivingDfi)}</td><td>${escapeHtml(entry.maskedAccountNumber)}</td><td>${escapeHtml(entry.individualId)}</td><td>${escapeHtml(entry.individualName)}</td><td>${entry.addendaCount} (${escapeHtml(entry.addendaIndicator || '0')})</td></tr>`).join('')}</tbody></table></div>`}`;
}

function issueList(issues: ValidationIssue[]): string {
	if (issues.length === 0) { return ''; }
	return `<h2>Validation Issues</h2><table><thead><tr><th>Severity</th><th>Context</th><th>Message</th><th>Expected</th><th>Actual</th></tr></thead><tbody>${issues.map(issue => `<tr><td><span class="status-badge ${issue.severity === 'error' ? 'fail' : 'warning'}">${issue.severity.toUpperCase()}</span></td><td>${escapeHtml(issue.context || (issue.lineNumber ? `Line ${issue.lineNumber}` : 'File'))}</td><td>${escapeHtml(issue.message)}</td><td>${issue.expected === undefined ? '—' : escapeHtml(String(issue.expected))}</td><td>${issue.actual === undefined ? '—' : escapeHtml(String(issue.actual))}</td></tr>`).join('')}</tbody></table>`;
}

function display(value: string | number, monetary?: boolean): string { return monetary && typeof value === 'number' ? formatAchAmount(value) : escapeHtml(String(value)); }
function escapeHtml(value: string): string { return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
