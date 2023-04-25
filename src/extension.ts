import * as vscode from 'vscode';
import reminders from './reminders';

let lastComand = {
	keyword: '',
	value: ''
};

const search = (value: string) => {
	return reminders.find(item => item.keyword.includes(value));
};

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "cominder" is now active!');

	let helloWorld = vscode.commands.registerCommand('cominder.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from cominder!');
	});

	let dialog = vscode.commands.registerCommand('cominder.dialog', () => {
		vscode.window.showOpenDialog();
	});

	let openCominder = vscode.commands.registerCommand('cominder.open', async () => {
		let commands: vscode.QuickPickItem[] = [];

		const pathWorkspace = vscode.workspace.workspaceFolders?.[0];
		const pathFile = vscode.Uri.file(pathWorkspace?.uri.fsPath + '/package.json');
		const file = await vscode.workspace.fs.readFile(pathFile);
		const json = JSON.parse(file.toString());
		
		commands.push(
			...Object.keys(json.scripts).map(key => ({
				label: key,
				detail: json.scripts[key],
				isDefault: true,
			}))
		);
		
		if(lastComand.keyword){
			commands.push({
				label: 'Último Comando:',
				description: lastComand.keyword,
				detail: lastComand.value,
			});
		}
		
		commands.push(
			...reminders.map(command => ({
				label: command.keyword,
				detail: command.value
			}))
		);

		const command = await vscode.window.showQuickPick(commands);

		if(command && command.label === 'Último Comando'){
			vscode.env.clipboard.writeText(command.detail || '');
			return vscode.window.showInformationMessage(`Comando: ${command.detail} copiado para a área de transferência`);
		}

		if(!command) {
			return vscode.window.showErrorMessage('Informe uma palavra chave para buscar um comando');
		}

		const searchedTerm = command.isDefault ? command : search(command.label);

		if(!searchedTerm) {
			return vscode.window.showErrorMessage('Comando não localizado!');
		}

		let responseTerm = '';
		if(searchedTerm.hasVariable){
			responseTerm = searchedTerm.value;
			let variables = searchedTerm.value.match(/\{\{(.*?)\}\}/g)
				?.map(variable => ({
					key: variable,
					keyParsed: variable.replace('{{','').replace('}}',''),
				}));

			if(variables && variables.length > 0){
				for (const variable of variables) {
					const value = await vscode.window.showInputBox({
						title: `Informe o parâmetro: ${variable.keyParsed.toUpperCase()}`,
					});
					
					responseTerm = responseTerm.replace(variable.key, value || '');
				}
			} else {
				responseTerm = searchedTerm.value;
			}
		} else {
			responseTerm = searchedTerm.value;
		}

		console.log('RETORNO', responseTerm);

		lastComand = {
			keyword: searchedTerm.keyword,
			value: responseTerm
		};
		vscode.env.clipboard.writeText(responseTerm);
		return vscode.window.showInformationMessage(`Comando: ${responseTerm} copiado para a área de transferência`);
	});

	context.subscriptions.push(helloWorld, openCominder, dialog);
}

export function deactivate() {}
