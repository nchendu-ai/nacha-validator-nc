import * as vscode from 'vscode';
import { parseAchRecord } from '../parser/achParser';

export class AchHoverProvider
	implements vscode.HoverProvider {

	provideHover(
		document: vscode.TextDocument,
		position: vscode.Position
	): vscode.ProviderResult<vscode.Hover> {

		const line = document.lineAt(position.line).text;

		if (!line) {
			return undefined;
		}

		const record = parseAchRecord(
			line,
			position.line + 1
		);

		for (const field of record.fields) {

			const startColumn = field.start - 1;
			const endColumn = field.end;

			if (
				position.character >= startColumn &&
				position.character < endColumn
			) {
				return new vscode.Hover(
					new vscode.MarkdownString(
						this.createHoverContent(field)
					)
				);
			}
		}

		return undefined;
	}

	private createHoverContent(
		field: {
			name: string;
			start: number;
			end: number;
			description: string;
			value: string;
		}
	): string {

		return [
			`### ${field.name}`,
			'',
			`**Positions:** ${field.start}–${field.end}`,
			'',
			`**Value:** \`${field.value || '(blank)'}\``,
			'',
			field.description
		].join('\n');
	}
}
