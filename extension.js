// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**

 * @type {{ [key: string]: { type: string, name: string, description: string ,lineNumber:number,namestart:number}[] }}
*/
const groups={}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

const languages = ['cpp', 'csharp', 'javascript'];

	for (const language of languages) {
    	const completionProvider =
        	vscode.languages.registerCompletionItemProvider(
            	{ language: language },
            	{
                	provideCompletionItems(document, position) {
                    	const headerItem =
                    	    new vscode.CompletionItem('//\\HEADER:');
                    	headerItem.insertText = '\\HEADER:';

                    	const endItem =
                    	    new vscode.CompletionItem('//\\END');
                    	endItem.insertText = '\\END';

                    	return [headerItem, endItem];
                	}
        	
			},
       		'/'
    	);

    context.subscriptions.push(completionProvider);
}

	const provider = new VariableProvider();

	vscode.window.registerTreeDataProvider(
    	'variableSidebar',
    	provider
	);
	const changeListener =
    vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;

        if (editor && event.document === editor.document) {
            updateVariableList(event.document);
        }
    });
	const editorListener =
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateVariableList(editor.document);
        }
    });

context.subscriptions.push(editorListener);

context.subscriptions.push(changeListener);
	function updateVariableList(document){
		for (const key of Object.keys(groups)) {
		    delete groups[key];
		}
		groups[''] = [];
		let onCheck=false;
		const allText=document.getText();
		let groupName='';
		//vscode.window.showInformationMessage(allText);
		let spritText=allText.split('\n');
		for(let i=0; i<spritText.length; i++){
			spritText[i]=spritText[i].trim();
			if(spritText[i].startsWith('//\\HEADER:')){
				onCheck=true;
				groupName=spritText[i].slice(10-spritText[i].length);
				groupName=groupName.trim();
				groups[groupName]=[];
			}
			else if(spritText[i].includes('//\\END')){
				onCheck=false;
			}
			else if(onCheck){
				const variable=parseVariable(spritText[i],i);
				if(variable!=null){
					groups[groupName].push(variable);
				}			
			}
		}
		provider.refresh();
	}

	const goToVariable = vscode.commands.registerCommand(
    'variable-manager.goToVariable',
    function (lineNumber,name,namestart) {
        const editor = vscode.window.activeTextEditor;

        if (editor === undefined) {
            return;
        }
		const startPos=new vscode.Position(lineNumber,namestart);
		const endPos=new vscode.Position(lineNumber,namestart+name.length);
        editor.selection = new vscode.Selection(startPos, endPos);
        editor.revealRange(
            new vscode.Range(startPos,endPos),
            vscode.TextEditorRevealType.InCenter
        );
		//vscode.commands.executeCommand('editor.action.rename');
    }
);

context.subscriptions.push(goToVariable);

	/*const disposable = vscode.commands.registerCommand('variable-manager.helloWorld', function () {

		const editor=vscode.window.activeTextEditor;
			
			
			if(editor==undefined){
				vscode.window.showWarningMessage('エディタを開いてください');
			}else{
				updateVariableList(editor.document);
			}
	});

	context.subscriptions.push(disposable);*/
}

/**
 *  @param {string} line 
 * @param {number}number
*/
function parseVariable(line,number){
	const variable={
			type:'',
			name:'',
			description:'',
			lineNumber:0,
			namestart:0
		}
	variable.lineNumber=number;
	if(line==''){
		return null;
	}
	let spritResult=line.split('//');
	if(spritResult[1]!=null){
		variable.description=spritResult[1].trim();
	}
	if(spritResult[0].includes('=')){//=を取り除く
		const spritResult3=spritResult[0].split('=');
		spritResult[0]=spritResult3[0];
	}
	let spritResult2=spritResult[0].trim().split(/\s+/);
	if(spritResult2[0]==''){
		return null;
	}
	if(spritResult2[spritResult2.length-1]==';'){
		variable.name=spritResult2[spritResult2.length-2];
		spritResult2.pop();
		spritResult2.pop();
	}else{
		variable.name=spritResult2[spritResult2.length-1];
		spritResult2.pop();
	}
	if(variable.name.includes(';')){
		variable.name=variable.name.slice(0,-1);
	}
	for(let i=0;i<spritResult2.length;i++){
		variable.type=variable.type+' '+spritResult2[i];
	}
	variable.type=variable.type.trim();
	variable.namestart=line.indexOf(variable.name);

	/*else if(spritResult2[0]=='long'&&spritResult2[1]=='long'){
		spritResult2[2]=spritResult2[2].slice(0,-1);
		spritResult2[0]='long long';
		variable.type=spritResult2[0].trim();
		variable.name=spritResult2[2].trim();
	}else if(spritResult2[1].includes(';')){
		spritResult2[1]=spritResult2[1].slice(0,-1);
		variable.type=spritResult2[0].trim();
		variable.name=spritResult2[1].trim();
	}
	else{
		return null;
	}*/
	
	return variable;
}

class VariableProvider {
    getTreeItem(element) {
        return element;
    }

    getChildren(element) {
        const items=[];
		if(element==undefined){
			for(const g of Object.keys(groups)){
				if(g!=''){
					items.push(new vscode.TreeItem(g,vscode.TreeItemCollapsibleState.Expanded));
				}
			}
		}else{
			for(const n of groups[element.label]){
				const item =new vscode.TreeItem(n.name);
				item.description = `${n.type} | ${n.description}`;
				const icon =getTypeIcon(n.type);
				item.iconPath=new vscode.ThemeIcon(icon.pic,new vscode.ThemeColor(icon.color));
				item.command = {
	  	  			command: 'variable-manager.goToVariable',
    				title: '変数の宣言場所へ移動',
    				arguments: [n.lineNumber,n.name,n.namestart]
					};
				items.push(item);
			}
		}
		return items;
    }

	constructor() {
		/** @type {vscode.EventEmitter<void>} */
    	this._onDidChangeTreeData = new vscode.EventEmitter();
   		this.onDidChangeTreeData = this._onDidChangeTreeData.event;
	}

	refresh() {
	    this._onDidChangeTreeData.fire();
	}
}

/**
 * 
 * @param {string} type 
 */
function getTypeIcon(type){
	let icon={
		pic:'',
		color:''
	};
	switch(type){
		case 'int':
		case 'short':
		case 'long':
		case 'long long':
		case 'unsigned int':
			icon.pic='symbol-field';
			icon.color='charts.blue';
			break;
		case 'double':
		case 'float':
			icon.pic='symbol-operator';
			icon.color='charts.green';
			break;
		case 'char':
		case 'wchar_t':
		case 'char32_t':
		case 'char16_t':
		case 'char8_t':
			icon.pic='symbol-parameter';
			icon.color='charts.yellow';
			break;
		case 'string':
		case 'std::string':
			icon.pic='case-sensitive';
			icon.color='charts.yellow';
			break;
		case 'bool':
			icon.pic='pass';
			icon.color='charts.purple';
			break;
		case 'int*':
		case 'int&':
			icon.pic='location';
			icon.color='charts.red';
			break;
		default:
			icon.pic='symbol-variable';
			icon.color='charts.blue';
			break;
	}
	return icon;
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
