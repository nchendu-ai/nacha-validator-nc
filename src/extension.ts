import * as vscode from 'vscode';
import { validateNachaCommand } from './commands/validateNacha';
import { AchHoverProvider } from './language/hoverProvider';
import {
	AchSemanticTokensProvider,
	achSemanticTokenLegend
} from './language/semanticTokensProvider';

export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand(
		'ach-nacha-validator-nc.helloWorld',
		() => validateNachaCommand(context)
	);

	const hoverProvider =
		vscode.languages.registerHoverProvider(
			{ scheme: 'file' },
			new AchHoverProvider()
		);

	const semanticTokensProvider =
		vscode.languages.registerDocumentSemanticTokensProvider(
			{ scheme: 'file' },
			new AchSemanticTokensProvider(),
			achSemanticTokenLegend
		);

	context.subscriptions.push(
		disposable,
		hoverProvider,
		semanticTokensProvider
	);
}

export function deactivate() {}
