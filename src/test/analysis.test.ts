import * as assert from 'assert';
import { analyzeAchFile, classifyTransaction } from '../analysis/achFileAnalyzer';
import { formatAchAmount, parseAchAmount } from '../analysis/achAmount';

function record(type: string, fields: Array<[number, number, string]>): string {
	const characters = Array.from({ length: 94 }, () => ' ');
	characters[0] = type;
	for (const [start, end, value] of fields) {
		characters.splice(start - 1, end - start + 1, ...value.padStart(end - start + 1, '0').slice(-1 * (end - start + 1)));
	}
	return characters.join('');
}

suite('ACH analysis', () => {
	test('parses and formats whole-cent amounts', () => {
		assert.strictEqual(parseAchAmount('0000000100'), 100);
		assert.strictEqual(parseAchAmount('0000012500'), 12500);
		assert.strictEqual(formatAchAmount(12500), '$125.00');
	});

	test('classifies known and unknown transaction codes', () => {
		assert.strictEqual(classifyTransaction('22'), 'Credit');
		assert.strictEqual(classifyTransaction('27'), 'Debit');
		assert.strictEqual(classifyTransaction('99'), 'Unknown');
	});

	test('groups entries, addenda, amounts, hashes, and matching controls', () => {
		const header = record('5', [[2, 4, '220'], [5, 20, 'ACME'], [41, 50, '1234567890'], [51, 53, 'PPD'], [54, 63, 'PAYROLL'], [88, 94, '1']]);
		const credit = record('6', [[2, 3, '22'], [4, 11, '9100001'], [13, 29, '123456789'], [30, 39, '12500'], [55, 76, 'JANE'], [79, 79, '1'], [80, 94, '910000100000001']]);
		const addenda = record('7', [[2, 3, '5']]);
		const debit = record('6', [[2, 3, '27'], [4, 11, '9100002'], [13, 29, '987654321'], [30, 39, '100'], [55, 76, 'JOHN'], [80, 94, '910000100000002']]);
		const batchControl = record('8', [[2, 4, '220'], [5, 10, '3'], [11, 20, '18200003'], [21, 32, '100'], [33, 44, '12500'], [45, 54, '1234567890'], [88, 94, '1']]);
		const fileControl = record('9', [[2, 7, '1'], [8, 13, '1'], [14, 21, '3'], [22, 31, '18200003'], [32, 43, '100'], [44, 55, '12500']]);
		const analysis = analyzeAchFile([record('1', []), header, credit, addenda, debit, batchControl, fileControl]);
		assert.strictEqual(analysis.batches.length, 1);
		assert.strictEqual(analysis.entries.length, 2);
		assert.strictEqual(analysis.addendaCount, 1);
		assert.strictEqual(analysis.creditCents, 12500);
		assert.strictEqual(analysis.debitCents, 100);
		assert.ok(analysis.batches[0].controlComparisons.every(comparison => comparison.passed));
		assert.ok(analysis.fileControlComparisons.every(comparison => comparison.passed));
	});

	test('reports control-total mismatches', () => {
		const batchHeader = record('5', [[88, 94, '1']]);
		const entry = record('6', [[2, 3, '22'], [4, 11, '1'], [30, 39, '100']]);
		const batchControl = record('8', [[5, 10, '1'], [11, 20, '1'], [21, 32, '0'], [33, 44, '100'], [88, 94, '1']]);
		const incorrectFileControl = record('9', [[2, 7, '1'], [8, 13, '1'], [14, 21, '1'], [22, 31, '1'], [32, 43, '0'], [44, 55, '99']]);
		const analysis = analyzeAchFile([record('1', []), batchHeader, entry, batchControl, incorrectFileControl]);
		assert.ok(analysis.fileControlComparisons.some(comparison => comparison.label === 'Total Credit' && !comparison.passed));
	});

	test('keeps entries in their respective batches', () => {
		const batch = (number: string) => record('5', [[88, 94, number]]);
		const entry = (amount: string) => record('6', [[2, 3, '22'], [4, 11, '1'], [30, 39, amount]]);
		const control = (number: string, amount: string) => record('8', [[5, 10, '1'], [11, 20, '1'], [21, 32, '0'], [33, 44, amount], [88, 94, number]]);
		const analysis = analyzeAchFile([record('1', []), batch('1'), entry('100'), control('1', '100'), batch('2'), entry('200'), control('2', '200')]);
		assert.strictEqual(analysis.batches.length, 2);
		assert.deepStrictEqual(analysis.batches.map(item => item.entries.length), [1, 1]);
	});
});
