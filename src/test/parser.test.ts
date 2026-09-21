import * as assert from 'assert';
import {
	parseAchRecord
} from '../parser/achParser';

suite('ACH Parser', () => {

	test('parses a File Header record', () => {

		const line =
			'101 123456789 9876543212609201234A094101BANK OF DESTINATION    BANK OF ORIGIN      REF12345';

		const record = parseAchRecord(line, 1);

		assert.strictEqual(record.recordType, '1');
		assert.strictEqual(record.lineNumber, 1);

		assert.strictEqual(
			record.fields[0].name,
			'Record Type Code'
		);

		assert.strictEqual(
			record.fields[0].value,
			'1'
		);

		assert.strictEqual(
			record.fields[1].name,
			'Priority Code'
		);

		assert.strictEqual(
			record.fields[1].value,
			'01'
		);
	});
});
