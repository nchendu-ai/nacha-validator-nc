import { AchFieldDefinition } from './fieldDefinitions';
import { getRecordFields } from './recordTypes';

export interface ParsedAchField {
	name: string;
	start: number;
	end: number;
	description: string;
	value: string;
}

export interface ParsedAchRecord {
	lineNumber: number;
	recordType: string;
	raw: string;
	fields: ParsedAchField[];
}

export function parseAchRecord(
	line: string,
	lineNumber: number
): ParsedAchRecord {

	const recordType = line.charAt(0);
	const definitions = getRecordFields(recordType) ?? [];

	const fields = definitions.map(
		(definition: AchFieldDefinition): ParsedAchField => ({
			name: definition.name,
			start: definition.start,
			end: definition.end,
			description: definition.description,
			value: line.slice(
				definition.start - 1,
				definition.end
			)
		})
	);

	return {
		lineNumber,
		recordType,
		raw: line,
		fields
	};
}

