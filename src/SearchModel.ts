import {App, Instruction, Notice, SuggestModal, TFile} from 'obsidian';
import SwitchFile from "./main";

export interface FileI {
	name: string;
	path: string;
	rank: number;
	lastOpened: string;
	pined: boolean;
}

export interface QueryFile {
	file: TFile;
	score: number;
	position: number[]
}

export class SearchModel extends SuggestModal<QueryFile> {
	private plugin: SwitchFile;

	constructor(app: App, plugin: SwitchFile) {
		super(app);
		this.plugin = plugin;
		this.setPlaceholder('Search');
	}

	getSuggestions(query: string): QueryFile[] | Promise<QueryFile[]> {
		return this.plugin.searchFiles(query);
		// if (query === '') {
		// 	return this.plugin.lastOpenedList.filter((file) =>
		// 		file.name.toLowerCase().includes(query.toLowerCase())
		// 	);
		// }
		//
		// return this.plugin.getAllFiles().filter((file) =>
		// 	file.name.toLowerCase().includes(query.toLowerCase())
		// );
	}
	buildHighlighted(text: string, positions: number[]) {
		let out = "";

		for (let i = 0; i < text.length; i++) {
			if (positions.includes(i)) {
				out += `<b class="cm-highlight">${text[i]}</b>`;
			} else {
				out += text[i];
			}
		}

		return out;
	}

	// Renders each suggestion item.
	renderSuggestion(queryFile: QueryFile, el: HTMLElement) {

		// el.createEl('div', {text: queryFile.file.name});
		// el.createEl('small', {text: file.path});
		const title = el.createEl("div");
		title.innerHTML = this.buildHighlighted(queryFile.file.basename, queryFile.position);
	}

	// Perform action on the selected suggestion.
	onChooseSuggestion(queryFile: QueryFile, evt: MouseEvent | KeyboardEvent) {
		void this.plugin.focusFile(queryFile.file.path);
	}


}
