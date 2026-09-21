import {
	AchFieldDefinition,
	FILE_HEADER_FIELDS,
	BATCH_HEADER_FIELDS,
	ENTRY_DETAIL_FIELDS,
	ADDENDA_FIELDS,
	BATCH_CONTROL_FIELDS,
	FILE_CONTROL_FIELDS
} from './fieldDefinitions';

export const ACH_RECORD_FIELDS: Record<string, AchFieldDefinition[]> = {
	'1': FILE_HEADER_FIELDS,
	'5': BATCH_HEADER_FIELDS,
	'6': ENTRY_DETAIL_FIELDS,
	'7': ADDENDA_FIELDS,
	'8': BATCH_CONTROL_FIELDS,
	'9': FILE_CONTROL_FIELDS
};

export function getRecordFields(
	recordType: string
): AchFieldDefinition[] | undefined {
	return ACH_RECORD_FIELDS[recordType];
}
