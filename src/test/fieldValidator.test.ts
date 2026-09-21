import * as assert from 'assert';
import { validateAchFields } from '../validation/achFieldValidator';

function line(type: string, values: Array<[number, string]>): string {
	const result = Array.from({ length: 94 }, () => ' ');
	result[0] = type;
	for (const [start, value] of values) { result.splice(start - 1, value.length, ...value); }
	return result.join('');
}

suite('ACH field validation', () => {
	test('checks File Header constants', () => {
		const issues = validateAchFields([line('1', [[2, '99'], [35, '094'], [38, '10'], [40, '1']])]);
		assert.ok(issues.some(issue => issue.message.includes('Priority Code')));
	});

	test('reports a bad routing check digit and TEL addenda', () => {
		const batch = line('5', [[51, 'TEL'], [80, '09100001']]);
		const entry = line('6', [[4, '091000010'], [80, '091000010000001']]);
		const addenda = line('7', [[2, '05'], [84, '0001']]);
		const issues = validateAchFields([batch, entry, addenda]);
		assert.ok(issues.some(issue => issue.message.includes('check digit')));
		assert.ok(issues.some(issue => issue.message.includes('TEL entries do not allow')));
	});
});
