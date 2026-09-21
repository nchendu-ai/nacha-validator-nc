export interface AchFieldDefinition {
	recordType: string;
	name: string;
	start: number;
	end: number;
	description: string;
}

export const FILE_HEADER_FIELDS: AchFieldDefinition[] = [
	{
		recordType: '1',
		name: 'Record Type Code',
		start: 1,
		end: 1,
		description: 'Identifies this record as a File Header record.'
	},
	{
		recordType: '1',
		name: 'Priority Code',
		start: 2,
		end: 3,
		description: 'Identifies the priority or processing order of the ACH file.'
	},
	{
		recordType: '1',
		name: 'Immediate Destination',
		start: 4,
		end: 13,
		description: 'Identifies the immediate destination of the ACH file.'
	},
	{
		recordType: '1',
		name: 'Immediate Origin',
		start: 14,
		end: 23,
		description: 'Identifies the immediate origin of the ACH file.'
	},
	{
		recordType: '1',
		name: 'File Creation Date',
		start: 24,
		end: 29,
		description: 'Date on which the ACH file was created.'
	},
	{
		recordType: '1',
		name: 'File Creation Time',
		start: 30,
		end: 33,
		description: 'Time at which the ACH file was created.'
	},
	{
		recordType: '1',
		name: 'File ID Modifier',
		start: 34,
		end: 34,
		description: 'Identifies the file when multiple files are created on the same date.'
	},
	{
		recordType: '1',
		name: 'Record Size',
		start: 35,
		end: 37,
		description: 'Defines the fixed record size for the ACH file. Standard ACH records contain 94 characters.'
	},
	{
		recordType: '1',
		name: 'Blocking Factor',
		start: 38,
		end: 39,
		description: 'Defines the number of records contained in each physical block of the file.'
	},
	{
		recordType: '1',
		name: 'Format Code',
		start: 40,
		end: 40,
		description: 'Identifies the format code used for the ACH file.'
	},
	{
		recordType: '1',
		name: 'Immediate Destination Name',
		start: 41,
		end: 63,
		description: 'Name of the immediate destination.'
	},
	{
		recordType: '1',
		name: 'Immediate Origin Name',
		start: 64,
		end: 86,
		description: 'Name of the immediate origin.'
	},
	{
		recordType: '1',
		name: 'Reference Code',
		start: 87,
		end: 94,
		description: 'Reference information assigned to the ACH file.'
	}
];

export const BATCH_HEADER_FIELDS: AchFieldDefinition[] = [
	{
		recordType: '5',
		name: 'Record Type Code',
		start: 1,
		end: 1,
		description: 'Identifies this record as a Batch Header record.'
	},
	{
		recordType: '5',
		name: 'Service Class Code',
		start: 2,
		end: 4,
		description: 'Identifies the general classification of entries in the batch.'
	},
	{
		recordType: '5',
		name: 'Company Name',
		start: 5,
		end: 20,
		description: 'Identifies the company or entity initiating the entries in the batch.'
	},
	{
		recordType: '5',
		name: 'Company Discretionary Data',
		start: 21,
		end: 40,
		description: 'Optional company-defined information associated with the batch.'
	},
	{
		recordType: '5',
		name: 'Company Identification',
		start: 41,
		end: 50,
		description: 'Identifies the company or entity responsible for the entries.'
	},
	{
		recordType: '5',
		name: 'Standard Entry Class Code',
		start: 51,
		end: 53,
		description: 'Identifies the Standard Entry Class (SEC) code governing the entries in the batch.'
	},
	{
		recordType: '5',
		name: 'Company Entry Description',
		start: 54,
		end: 63,
		description: 'Describes the purpose of the entries in the batch.'
	},
	{
		recordType: '5',
		name: 'Company Descriptive Date',
		start: 64,
		end: 69,
		description: 'Optional company-defined date associated with the batch.'
	},
	{
		recordType: '5',
		name: 'Effective Entry Date',
		start: 70,
		end: 75,
		description: 'Date on which the entries are intended to be settled.'
	},
	{
		recordType: '5',
		name: 'Settlement Date',
		start: 76,
		end: 78,
		description: 'Settlement date assigned by the ACH Operator.'
	},
	{
		recordType: '5',
		name: 'Originator Status Code',
		start: 79,
		end: 79,
		description: 'Identifies the status of the originating financial institution.'
	},
	{
		recordType: '5',
		name: 'ODFI Identification',
		start: 80,
		end: 87,
		description: 'Identifies the originating depository financial institution.'
	},
	{
		recordType: '5',
		name: 'Batch Number',
		start: 88,
		end: 94,
		description: 'Uniquely identifies the batch within the ACH file.'
	}
];

export const ENTRY_DETAIL_FIELDS: AchFieldDefinition[] = [
	{
		recordType: '6',
		name: 'Record Type Code',
		start: 1,
		end: 1,
		description: 'Identifies this record as an Entry Detail record.'
	},
	{
		recordType: '6',
		name: 'Transaction Code',
		start: 2,
		end: 3,
		description: 'Identifies the type of transaction being initiated.'
	},
	{
		recordType: '6',
		name: 'Receiving DFI Identification',
		start: 4,
		end: 11,
		description: 'Identifies the receiving depository financial institution.'
	},
	{
		recordType: '6',
		name: 'Check Digit',
		start: 12,
		end: 12,
		description: 'Check digit associated with the Receiving DFI Identification.'
	},
	{
		recordType: '6',
		name: 'DFI Account Number',
		start: 13,
		end: 29,
		description: 'Identifies the account at the receiving financial institution.'
	},
	{
		recordType: '6',
		name: 'Amount',
		start: 30,
		end: 39,
		description: 'Dollar amount of the ACH entry, expressed in cents without a decimal point.'
	},
	{
		recordType: '6',
		name: 'Individual Identification Number',
		start: 40,
		end: 54,
		description: 'Identification assigned to the individual or receiver associated with the entry.'
	},
	{
		recordType: '6',
		name: 'Individual Name',
		start: 55,
		end: 76,
		description: 'Name of the individual or receiving party.'
	},
	{
		recordType: '6',
		name: 'Discretionary Data',
		start: 77,
		end: 78,
		description: 'Optional information defined by the originating party.'
	},
	{
		recordType: '6',
		name: 'Addenda Record Indicator',
		start: 79,
		end: 79,
		description: 'Indicates whether one or more addenda records are associated with this entry.'
	},
	{
		recordType: '6',
		name: 'Trace Number',
		start: 80,
		end: 94,
		description: 'Uniquely identifies the entry and links it to related ACH records.'
	}
];

export const ADDENDA_FIELDS: AchFieldDefinition[] = [
	{
		recordType: '7',
		name: 'Record Type Code',
		start: 1,
		end: 1,
		description: 'Identifies this record as an Addenda record.'
	},
	{
		recordType: '7',
		name: 'Addenda Type Code',
		start: 2,
		end: 3,
		description: 'Identifies the type and purpose of the addenda information.'
	},
	{
		recordType: '7',
		name: 'Payment Related Information',
		start: 4,
		end: 83,
		description: 'Contains additional payment-related information associated with the entry.'
	},
	{
		recordType: '7',
		name: 'Addenda Sequence Number',
		start: 84,
		end: 87,
		description: 'Sequence number identifying the addenda record within the entry.'
	},
	{
		recordType: '7',
		name: 'Entry Detail Sequence Number',
		start: 88,
		end: 94,
		description: 'Links the addenda record to its associated Entry Detail record.'
	}
];

export const BATCH_CONTROL_FIELDS: AchFieldDefinition[] = [
	{
		recordType: '8',
		name: 'Record Type Code',
		start: 1,
		end: 1,
		description: 'Identifies this record as a Batch Control record.'
	},
	{
		recordType: '8',
		name: 'Service Class Code',
		start: 2,
		end: 4,
		description: 'Identifies the general classification of entries in the batch.'
	},
	{
		recordType: '8',
		name: 'Entry/Addenda Count',
		start: 5,
		end: 10,
		description: 'Number of Entry Detail and Addenda records contained in the batch.'
	},
	{
		recordType: '8',
		name: 'Entry Hash',
		start: 11,
		end: 20,
		description: 'Hash total derived from the Receiving DFI Identification values of entries in the batch.'
	},
	{
		recordType: '8',
		name: 'Total Debit Amount',
		start: 21,
		end: 32,
		description: 'Total dollar amount of debit entries in the batch, expressed in cents.'
	},
	{
		recordType: '8',
		name: 'Total Credit Amount',
		start: 33,
		end: 44,
		description: 'Total dollar amount of credit entries in the batch, expressed in cents.'
	},
	{
		recordType: '8',
		name: 'Company Identification',
		start: 45,
		end: 54,
		description: 'Identifies the company or entity responsible for the entries.'
	},
	{
		recordType: '8',
		name: 'Message Authentication Code',
		start: 55,
		end: 73,
		description: 'Optional authentication information associated with the batch.'
	},
	{
		recordType: '8',
		name: 'Reserved',
		start: 74,
		end: 79,
		description: 'Reserved field.'
	},
	{
		recordType: '8',
		name: 'ODFI Identification',
		start: 80,
		end: 87,
		description: 'Identifies the originating depository financial institution.'
	},
	{
		recordType: '8',
		name: 'Batch Number',
		start: 88,
		end: 94,
		description: 'Identifies the batch being closed by this control record.'
	}
];

export const FILE_CONTROL_FIELDS: AchFieldDefinition[] = [
	{
		recordType: '9',
		name: 'Record Type Code',
		start: 1,
		end: 1,
		description: 'Identifies this record as a File Control record.'
	},
	{
		recordType: '9',
		name: 'Batch Count',
		start: 2,
		end: 7,
		description: 'Number of Batch Header and Batch Control record pairs contained in the file.'
	},
	{
		recordType: '9',
		name: 'Block Count',
		start: 8,
		end: 13,
		description: 'Number of physical blocks contained in the ACH file.'
	},
	{
		recordType: '9',
		name: 'Entry/Addenda Count',
		start: 14,
		end: 21,
		description: 'Total number of Entry Detail and Addenda records contained in the file.'
	},
	{
		recordType: '9',
		name: 'Entry Hash',
		start: 22,
		end: 31,
		description: 'Hash total derived from the Receiving DFI Identification values of entries in the file.'
	},
	{
		recordType: '9',
		name: 'Total Debit Amount',
		start: 32,
		end: 43,
		description: 'Total dollar amount of debit entries in the file, expressed in cents.'
	},
	{
		recordType: '9',
		name: 'Total Credit Amount',
		start: 44,
		end: 55,
		description: 'Total dollar amount of credit entries in the file, expressed in cents.'
	},
	{
		recordType: '9',
		name: 'Reserved',
		start: 56,
		end: 94,
		description: 'Reserved field.'
	}
];
