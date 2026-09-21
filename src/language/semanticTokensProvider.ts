import * as vscode from 'vscode';
import { parseAchRecord } from '../parser/achParser';

export const achSemanticTokenTypes = [
	'achRecordType',
	'achFieldBlue',
	'achFieldDefault'
];

export const achSemanticTokenLegend =
	new vscode.SemanticTokensLegend(
		achSemanticTokenTypes
	);

export class AchSemanticTokensProvider
	implements vscode.DocumentSemanticTokensProvider {

	provideDocumentSemanticTokens(
		document: vscode.TextDocument
	): vscode.SemanticTokens {

		const builder = new vscode.SemanticTokensBuilder(
			achSemanticTokenLegend
		);

		for (
			let lineNumber = 0;
			lineNumber < document.lineCount;
			lineNumber++
		) {

			const line = document.lineAt(lineNumber).text;

			if (!line) {
				continue;
			}

			const record = parseAchRecord(
				line,
				lineNumber + 1
			);

			for (let fieldIndex = 0; fieldIndex < record.fields.length; fieldIndex++) {

				const field = record.fields[fieldIndex];

				let tokenType: string;

				if (field.name === 'Record Type Code') {
					tokenType = 'achRecordType';
				} else {
					tokenType =
						fieldIndex % 2 === 1
							? 'achFieldBlue'
							: 'achFieldDefault';
				}

				builder.push(
					new vscode.Range(
						lineNumber,
						field.start - 1,
						lineNumber,
						field.end
					),
					tokenType
				);
			}
		}

		return builder.build();
	}
}
