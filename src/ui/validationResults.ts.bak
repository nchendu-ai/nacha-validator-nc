import * as vscode from 'vscode';

import {
	AchBatchAnalysis,
	AchEntryAnalysis,
	AchFileAnalysis,
	ControlComparison
} from '../analysis/achFileAnalyzer';

import { formatAchAmount } from '../analysis/achAmount';

import {
	ValidationIssue,
	ValidationResult
} from '../validation/validationTypes';

const INITIAL_ENTRY_LIMIT = 100;

export function showValidationResults(
	context: vscode.ExtensionContext,
	fileName: string,
	lengthResult: ValidationResult,
	analysis: AchFileAnalysis,
	issues: ValidationIssue[]
): void {

	const panel = vscode.window.createWebviewPanel(
		'nachaValidationResults',
		'NACHA Validation Results',
		vscode.ViewColumn.Beside,
		{
			enableScripts: true
		}
	);

	const cssUri = panel.webview.asWebviewUri(
		vscode.Uri.joinPath(
			context.extensionUri,
			'media',
			'validation.css'
		)
	);

	const allIssues = [
		...lengthResult.errors.map(error => ({
			severity: 'error' as const,
			lineNumber: error.lineNumber,
			message: `Expected 94 characters, found ${error.actual}.`,
			expected: error.expected,
			actual: error.actual
		})),
		...issues
	];

	const isValid = allIssues.every(
		issue => issue.severity !== 'error'
	);

	const name = escapeHtml(
		fileName.split('/').pop() || fileName
	);

	panel.webview.html = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">

			<meta
				http-equiv="Content-Security-Policy"
				content="
					default-src 'none';
					style-src ${panel.webview.cspSource};
					script-src 'nonce-nachaValidator';
				"
			>

			<link
				rel="stylesheet"
				href="${cssUri}"
			>

			<title>NACHA Validation Results</title>
		</head>

		<body>

			<main class="container">

				<header class="header">
					<div class="title">NACHA Validation</div>
					<div class="file-name">${name}</div>
				</header>

				${status(isValid, allIssues.length)}

				${summary(analysis)}

				${controls(
					'File Control Reconciliation',
					analysis.fileControlComparisons
				)}

				<h2>Batches</h2>

				<div class="batch-list">
					${analysis.batches.map(
						(batch, index) =>
							batchSelector(batch, index)
					).join('')}
				</div>

				${analysis.batches.map(batch).join('')}

				${entryExplorer(analysis)}

				${issueList(allIssues)}

				<footer class="footer">
					NACHA Validator • Structural and control-total
					validation; not full NACHA Operating Rules compliance.
				</footer>

			</main>

			<script nonce="nachaValidator">

				const ENTRY_PAGE_SIZE = ${INITIAL_ENTRY_LIMIT};

				const entries = ${JSON.stringify(
					analysis.entries.map(entry => ({
						lineNumber: entry.lineNumber,
						batchNumber: entry.batchNumber,
						transactionCode: entry.transactionCode,
						transactionType: entry.transactionType,
						amountCents: entry.amountCents,
						receivingDfi: entry.receivingDfi,
						maskedAccountNumber: entry.maskedAccountNumber,
						individualId: entry.individualId,
						individualName: entry.individualName,
						addendaIndicator: entry.addendaIndicator,
						addendaCount: entry.addendaCount,
						traceNumber: entry.traceNumber
					}))
				)};

				let activeFilter = 'all';
				let activeBatch = null;
				let visibleCount = ENTRY_PAGE_SIZE;

				const explorerTitle =
					document.getElementById('entry-explorer-title');

				const explorerCount =
					document.getElementById('entry-explorer-count');

				const explorerBody =
					document.getElementById('entry-explorer-body');

				const showMoreButton =
					document.getElementById('entry-show-more');

				const emptyMessage =
					document.getElementById('entry-empty');

				function escapeHtml(value) {

					return String(value)
						.replace(/&/g, '&amp;')
						.replace(/</g, '&lt;')
						.replace(/>/g, '&gt;')
						.replace(/"/g, '&quot;')
						.replace(/'/g, '&#039;');

				}

				function formatAmount(cents) {

					return new Intl.NumberFormat(
						'en-US',
						{
							style: 'currency',
							currency: 'USD'
						}
					).format(cents / 100);

				}

				function filteredEntries() {

					return entries.filter(entry => {

						if (
							activeBatch !== null &&
							entry.batchNumber !== activeBatch
						) {
							return false;
						}

						if (
							activeFilter === 'credit' &&
							entry.transactionType !== 'Credit'
						) {
							return false;
						}

						if (
							activeFilter === 'debit' &&
							entry.transactionType !== 'Debit'
						) {
							return false;
						}

						return true;

					});

				}

				function updateActiveButton() {

					document
						.querySelectorAll('.entry-filter')
						.forEach(button => {

							const filter =
								button.getAttribute(
									'data-filter'
								);

							const batch =
								button.getAttribute(
									'data-batch'
								);

							const active =
								activeBatch !== null
									? batch === activeBatch &&
										activeFilter === 'all'
									: batch === null &&
										filter === activeFilter;

							button.classList.toggle(
								'active',
								active
							);

						});

				}

				function renderEntries() {

					const matchingEntries =
						filteredEntries();

					const rows =
						matchingEntries.slice(
							0,
							visibleCount
						);

					explorerCount.textContent =
						\`\${matchingEntries.length.toLocaleString()}
						 entry\${matchingEntries.length === 1 ? '' : 'ies'}\`;

					if (activeBatch !== null) {

						explorerTitle.textContent =
							\`Entries • Batch \${activeBatch}\`;

					} else if (activeFilter === 'credit') {

						explorerTitle.textContent =
							'Credit Entries';

					} else if (activeFilter === 'debit') {

						explorerTitle.textContent =
							'Debit Entries';

					} else {

						explorerTitle.textContent =
							'All Entries';

					}

					if (rows.length === 0) {

						explorerBody.innerHTML = '';

						emptyMessage.hidden = false;

						showMoreButton.hidden = true;

						updateActiveButton();

						return;

					}

					emptyMessage.hidden = true;

					explorerBody.innerHTML =
						rows.map(entry => {

							const typeClass =
								entry.transactionType === 'Credit'
									? 'entry-credit'
									: entry.transactionType === 'Debit'
										? 'entry-debit'
										: '';

							return \`
								<tr>
									<td>\${entry.lineNumber}</td>
									<td>\${escapeHtml(entry.batchNumber)}</td>
									<td>\${escapeHtml(entry.traceNumber)}</td>
									<td>\${escapeHtml(entry.transactionCode)}</td>
									<td>
										<span class="\${typeClass}">
											\${escapeHtml(entry.transactionType)}
										</span>
									</td>
									<td>\${formatAmount(entry.amountCents)}</td>
									<td>\${escapeHtml(entry.receivingDfi)}</td>
									<td>\${escapeHtml(entry.maskedAccountNumber)}</td>
									<td>\${escapeHtml(entry.individualId)}</td>
									<td>\${escapeHtml(entry.individualName)}</td>
									<td>
										\${entry.addendaCount}
										(\${escapeHtml(
											entry.addendaIndicator || '0'
										)})
									</td>
								</tr>
							\`;

						}).join('');

					showMoreButton.hidden =
						rows.length >= matchingEntries.length;

					showMoreButton.textContent =
						\`Show More
						 (\${Math.max(
								0,
								matchingEntries.length - rows.length
							).toLocaleString()} remaining)\`;

					updateActiveButton();

				}

				function selectFilter(filter) {

					activeFilter = filter;
					activeBatch = null;
					visibleCount = ENTRY_PAGE_SIZE;

					renderEntries();

					document
						.getElementById('entry-explorer')
						.scrollIntoView({
							behavior: 'smooth',
							block: 'start'
						});

				}

				function selectBatch(batchNumber) {

					activeFilter = 'all';
					activeBatch = batchNumber;
					visibleCount = ENTRY_PAGE_SIZE;

					renderEntries();

					document
						.getElementById('entry-explorer')
						.scrollIntoView({
							behavior: 'smooth',
							block: 'start'
						});

				}

				document
					.querySelectorAll('.entry-filter')
					.forEach(button => {

						button.addEventListener(
							'click',
							() => {

								const batch =
									button.getAttribute(
										'data-batch'
									);

								if (batch !== null) {

									selectBatch(batch);

								} else {

									selectFilter(
										button.getAttribute(
											'data-filter'
										) || 'all'
									);

								}

							}
						);

					});

				showMoreButton.addEventListener(
					'click',
					() => {

						visibleCount += ENTRY_PAGE_SIZE;

						renderEntries();

					}
				);

				renderEntries();

			</script>

		</body>
		</html>
	`;
}

function status(
	valid: boolean,
	issueCount: number
): string {

	return `
		<section class="result-card ${valid ? 'success' : 'failure'}">

			<div class="result-icon">
				${valid ? '✓' : '!'}
			</div>

			<div class="result-title">
				${valid ? 'VALID NACHA FILE' : 'INVALID NACHA FILE'}
			</div>

			<div class="result-message">
				${
					valid
						? 'Record length, structure, fields, and available control totals reconciled.'
						: `${issueCount} validation issue${
								issueCount === 1 ? '' : 's'
							} found.`
				}
			</div>

		</section>
	`;
}

function summary(
	analysis: AchFileAnalysis
): string {

	const gross =
		analysis.debitCents +
		analysis.creditCents;

	const net =
		analysis.creditCents -
		analysis.debitCents;

	return `
		<h2>File Summary</h2>

		<section class="stats">

			${stat('Records', analysis.totalRecords)}
			${stat('Batches', analysis.batches.length)}
			${stat('Entries', analysis.entries.length)}
			${stat('Addenda', analysis.addendaCount)}
			${stat(
				'Entry + Addenda',
				analysis.entries.length +
					analysis.addendaCount
			)}
			${stat(
				'Debit',
				formatAchAmount(analysis.debitCents)
			)}
			${stat(
				'Credit',
				formatAchAmount(analysis.creditCents)
			)}
			${stat(
				'Gross',
				formatAchAmount(gross)
			)}
			${stat(
				'Net',
				formatAchAmount(net)
			)}

		</section>
	`;
}

function stat(
	label: string,
	value: string | number
): string {

	return `
		<div class="stat">
			<span class="stat-number">${value}</span>
			<span class="stat-label">${label}</span>
		</div>
	`;
}

function controls(
	title: string,
	comparisons: ControlComparison[]
): string {

	if (comparisons.length === 0) {

		return `
			<h2>${title}</h2>
			<p class="muted">
				No File Control record was available
				for reconciliation.
			</p>
		`;

	}

	return `
		<h2>${title}</h2>

		<table>

			<thead>
				<tr>
					<th>Check</th>
					<th>Calculated</th>
					<th>Declared</th>
					<th>Status</th>
				</tr>
			</thead>

			<tbody>

				${comparisons.map(
					comparison => `
						<tr>

							<td>
								${escapeHtml(
									comparison.label
								)}
							</td>

							<td>
								${display(
									comparison.calculated,
									comparison.monetary
								)}
							</td>

							<td>
								${display(
									comparison.declared,
									comparison.monetary
								)}
							</td>

							<td>
								<span class="status-badge ${
									comparison.passed
										? 'pass'
										: 'fail'
								}">
									${
										comparison.passed
											? 'PASS'
											: 'FAIL'
									}
								</span>
							</td>

						</tr>
					`
				).join('')}

			</tbody>

		</table>
	`;
}

function batchSelector(
	batch: AchBatchAnalysis,
	index: number
): string {

	const label =
		batch.companyName ||
		'Unnamed company';

	return `
		<button
			class="entry-filter batch-filter"
			data-batch="${escapeHtml(batch.batchNumber)}"
			type="button"
			title="Show entries from batch ${escapeHtml(batch.batchNumber)}"
		>

			<span class="batch-filter-number">
				BATCH ${escapeHtml(
					batch.batchNumber ||
					String(index + 1).padStart(7, '0')
				)}
			</span>

			<span class="batch-filter-company">
				${escapeHtml(label)}
			</span>

			<span class="batch-filter-count">
				${batch.entries.length.toLocaleString()}
				entries
			</span>

		</button>
	`;
}

function batch(
	batch: AchBatchAnalysis
): string {

	const gross =
		batch.debitCents +
		batch.creditCents;

	return `
		<details class="batch" open>

			<summary>
				BATCH ${escapeHtml(
					batch.batchNumber || '(unknown)'
				)}
				—
				${escapeHtml(
					batch.companyName ||
					'Unnamed company'
				)}
			</summary>

			<div class="batch-content">

				<dl class="metadata">

					<dt>Company</dt>
					<dd>
						${escapeHtml(batch.companyName)}
					</dd>

					<dt>Company ID</dt>
					<dd>
						${escapeHtml(batch.companyId)}
					</dd>

					<dt>SEC</dt>
					<dd>
						${escapeHtml(batch.secCode)}
					</dd>

					<dt>Service Class</dt>
					<dd>
						${escapeHtml(batch.serviceClass)}
					</dd>

					<dt>Entry Description</dt>
					<dd>
						${escapeHtml(batch.entryDescription)}
					</dd>

					<dt>Effective Date</dt>
					<dd>
						${escapeHtml(batch.effectiveEntryDate)}
					</dd>

				</dl>

				<section class="stats">

					${stat(
						'Entries',
						batch.entries.length
					)}

					${stat(
						'Addenda',
						batch.addendaCount
					)}

					${stat(
						'Debit',
						formatAchAmount(
							batch.debitCents
						)
					)}

					${stat(
						'Credit',
						formatAchAmount(
							batch.creditCents
						)
					)}

					${stat(
						'Gross',
						formatAchAmount(gross)
					)}

					${stat(
						'Net',
						formatAchAmount(
							batch.creditCents -
							batch.debitCents
						)
					)}

				</section>

				${controls(
					'Batch Control Reconciliation',
					batch.controlComparisons
				)}

			</div>

		</details>
	`;
}

function entryExplorer(
	analysis: AchFileAnalysis
): string {

	const creditCount =
		analysis.entries.filter(
			entry => entry.transactionType === 'Credit'
		).length;

	const debitCount =
		analysis.entries.filter(
			entry => entry.transactionType === 'Debit'
		).length;

	return `
		<section id="entry-explorer">

			<div class="entry-explorer-header">

				<div>

					<h2 id="entry-explorer-title">
						All Entries
					</h2>

					<div
						id="entry-explorer-count"
						class="muted"
					>
						${analysis.entries.length.toLocaleString()}
						entries
					</div>

				</div>

				<div class="entry-filters">

					<button
						class="entry-filter active"
						data-filter="all"
						type="button"
					>
						All
						<span>
							${analysis.entries.length.toLocaleString()}
						</span>
					</button>

					<button
						class="entry-filter"
						data-filter="credit"
						type="button"
					>
						Credits
						<span>
							${creditCount.toLocaleString()}
						</span>
					</button>

					<button
						class="entry-filter"
						data-filter="debit"
						type="button"
					>
						Debits
						<span>
							${debitCount.toLocaleString()}
						</span>
					</button>

				</div>

			</div>

			<div class="table-scroll">

				<table>

					<thead>

						<tr>
							<th>Line</th>
							<th>Batch</th>
							<th>Trace</th>
							<th>Transaction</th>
							<th>Type</th>
							<th>Amount</th>
							<th>Receiving DFI</th>
							<th>Account</th>
							<th>Individual ID</th>
							<th>Name</th>
							<th>Addenda</th>
						</tr>

					</thead>

					<tbody id="entry-explorer-body"></tbody>

				</table>

			</div>

			<p
				id="entry-empty"
				class="muted"
				hidden
			>
				No entries match the selected filter.
			</p>

			<div class="entry-more-container">

				<button
					id="entry-show-more"
					class="entry-show-more"
					type="button"
				>
					Show More
				</button>

			</div>

		</section>
	`;
}

function issueList(
	issues: ValidationIssue[]
): string {

	if (issues.length === 0) {
		return '';
	}

	return `
		<h2>Validation Issues</h2>

		<table>

			<thead>

				<tr>
					<th>Severity</th>
					<th>Context</th>
					<th>Message</th>
					<th>Expected</th>
					<th>Actual</th>
				</tr>

			</thead>

			<tbody>

				${issues.map(
					issue => `
						<tr>

							<td>
								<span class="status-badge ${
									issue.severity === 'error'
										? 'fail'
										: 'warning'
								}">
									${issue.severity.toUpperCase()}
								</span>
							</td>

							<td>
								${escapeHtml(
									issue.context ||
									(
										issue.lineNumber
											? `Line ${issue.lineNumber}`
											: 'File'
									)
								)}
							</td>

							<td>
								${escapeHtml(
									issue.message
								)}
							</td>

							<td>
								${
									issue.expected === undefined
										? '—'
										: escapeHtml(
											String(
												issue.expected
											)
										)
								}
							</td>

							<td>
								${
									issue.actual === undefined
										? '—'
										: escapeHtml(
											String(
												issue.actual
											)
										)
								}
							</td>

						</tr>
					`
				).join('')}

			</tbody>

		</table>
	`;
}

function display(
	value: string | number,
	monetary?: boolean
): string {

	return monetary &&
		typeof value === 'number'
		? formatAchAmount(value)
		: escapeHtml(String(value));
}

function escapeHtml(
	value: string
): string {

	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}
