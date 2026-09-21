import { parseAchAmount } from './achAmount';

const HASH_MODULUS = 10_000_000_000;

export type TransactionType = 'Credit' | 'Debit' | 'Unknown';

export interface AchEntryAnalysis {
	lineNumber: number;
	transactionCode: string;
	transactionType: TransactionType;
	amountCents: number;
	receivingDfi: string;
	maskedAccountNumber: string;
	individualId: string;
	individualName: string;
	addendaIndicator: string;
	addendaCount: number;
	traceNumber: string;
}

export interface ControlComparison {
	label: string;
	calculated: number | string;
	declared: number | string;
	passed: boolean;
	monetary?: boolean;
}

export interface AchBatchAnalysis {
	batchNumber: string;
	companyName: string;
	companyId: string;
	secCode: string;
	serviceClass: string;
	odfiIdentification: string;
	entryDescription: string;
	effectiveEntryDate: string;
	entries: AchEntryAnalysis[];
	addendaCount: number;
	debitCount: number;
	creditCount: number;
	debitCents: number;
	creditCents: number;
	entryHash: number;
	controlComparisons: ControlComparison[];
}

export interface AchFileAnalysis {
	totalRecords: number;
	batches: AchBatchAnalysis[];
	entries: AchEntryAnalysis[];
	addendaCount: number;
	debitCents: number;
	creditCents: number;
	entryHash: number;
	fileControlComparisons: ControlComparison[];
}

export function classifyTransaction(code: string): TransactionType {
	if (['22', '23', '32', '33'].includes(code)) { return 'Credit'; }
	if (['27', '28', '37', '38'].includes(code)) { return 'Debit'; }
	return 'Unknown';
}

function value(line: string, start: number, end: number): string {
	return line.slice(start - 1, end).trim();
}

function numberValue(line: string, start: number, end: number): number {
	return parseAchAmount(value(line, start, end));
}

function hash(valueToAdd: number, currentHash: number): number {
	return (currentHash + valueToAdd) % HASH_MODULUS;
}

function maskAccount(account: string): string {
	const trimmed = account.trim();
	return trimmed.length <= 4 ? '*'.repeat(trimmed.length) : `${'*'.repeat(Math.max(6, trimmed.length - 4))}${trimmed.slice(-4)}`;
}

export function analyzeAchFile(lines: string[]): AchFileAnalysis {
	const batches: AchBatchAnalysis[] = [];
	let currentBatch: AchBatchAnalysis | undefined;
	let lastEntry: AchEntryAnalysis | undefined;
	let fileControl: string | undefined;
	let addendaCount = 0;

	for (let index = 0; index < lines.length; index++) {
		const line = lines[index];
		const recordType = line.charAt(0);
		if (recordType === '5') {
			currentBatch = {
				batchNumber: value(line, 88, 94), companyName: value(line, 5, 20), companyId: value(line, 41, 50),
				secCode: value(line, 51, 53), serviceClass: value(line, 2, 4), odfiIdentification: value(line, 80, 87), entryDescription: value(line, 54, 63),
				effectiveEntryDate: value(line, 70, 75), entries: [], addendaCount: 0, debitCount: 0, creditCount: 0,
				debitCents: 0, creditCents: 0, entryHash: 0, controlComparisons: []
			};
			batches.push(currentBatch);
			lastEntry = undefined;
		} else if (recordType === '6' && currentBatch) {
			const transactionCode = value(line, 2, 3);
			const transactionType = classifyTransaction(transactionCode);
			const amountCents = numberValue(line, 30, 39);
			lastEntry = {
				lineNumber: index + 1, transactionCode, transactionType, amountCents,
				receivingDfi: value(line, 4, 11), maskedAccountNumber: maskAccount(value(line, 13, 29)),
				individualId: value(line, 40, 54), individualName: value(line, 55, 76),
				addendaIndicator: value(line, 79, 79), addendaCount: 0, traceNumber: value(line, 80, 94)
			};
			currentBatch.entries.push(lastEntry);
			currentBatch.entryHash = hash(numberValue(line, 4, 11), currentBatch.entryHash);
			if (transactionType === 'Debit') { currentBatch.debitCount++; currentBatch.debitCents += amountCents; }
			if (transactionType === 'Credit') { currentBatch.creditCount++; currentBatch.creditCents += amountCents; }
		} else if (recordType === '7' && currentBatch && lastEntry) {
			lastEntry.addendaCount++;
			currentBatch.addendaCount++;
			addendaCount++;
		} else if (recordType === '8' && currentBatch) {
			const count = currentBatch.entries.length + currentBatch.addendaCount;
			currentBatch.controlComparisons = [
				comparison('Entry/Addenda Count', count, numberValue(line, 5, 10)),
				comparison('Entry Hash', currentBatch.entryHash, numberValue(line, 11, 20)),
				comparison('Total Debit', currentBatch.debitCents, numberValue(line, 21, 32), true),
				comparison('Total Credit', currentBatch.creditCents, numberValue(line, 33, 44), true),
				comparison('Batch Number', currentBatch.batchNumber, value(line, 88, 94)),
				comparison('Company Identification', currentBatch.companyId, value(line, 45, 54)),
				comparison('Service Class', currentBatch.serviceClass, value(line, 2, 4)),
				comparison('ODFI Identification', currentBatch.odfiIdentification, value(line, 80, 87))
			];
			currentBatch = undefined;
			lastEntry = undefined;
		} else if (recordType === '9' && !fileControl && line.slice(1).trim() !== '' && !/^9+$/.test(line)) {
			fileControl = line;
		}
	}

	const entries = batches.flatMap(batch => batch.entries);
	const debitCents = batches.reduce((total, batch) => total + batch.debitCents, 0);
	const creditCents = batches.reduce((total, batch) => total + batch.creditCents, 0);
	const entryHash = batches.reduce((total, batch) => hash(batch.entryHash, total), 0);
	const entryAddendaCount = entries.length + addendaCount;
	const fileControlComparisons = fileControl ? [
		comparison('Batch Count', batches.length, numberValue(fileControl, 2, 7)),
		comparison('Block Count', Math.ceil(lines.length / 10), numberValue(fileControl, 8, 13)),
		comparison('Entry/Addenda Count', entryAddendaCount, numberValue(fileControl, 14, 21)),
		comparison('Entry Hash', entryHash, numberValue(fileControl, 22, 31)),
		comparison('Total Debit', debitCents, numberValue(fileControl, 32, 43), true),
		comparison('Total Credit', creditCents, numberValue(fileControl, 44, 55), true)
	] : [];

	return { totalRecords: lines.length, batches, entries, addendaCount, debitCents, creditCents, entryHash, fileControlComparisons };
}

function comparison(label: string, calculated: number | string, declared: number | string, monetary = false): ControlComparison {
	return { label, calculated, declared, passed: calculated === declared, monetary };
}
