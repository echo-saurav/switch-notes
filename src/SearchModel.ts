import {App, Instruction, Notice, SuggestModal, TFile} from 'obsidian';
import SwitchFile from "./main";

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
	}

	buildHighlighted(text: string, positions: number[]) {
		let out = "";

		for (let i = 0; i < text.length; i++) {
			if (positions.includes(i)) {
				out += `<span class="search-match">${text[i]}</span>`;
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
		title.classList.add("search-container");
		title.innerHTML = this.buildHighlighted(queryFile.file.basename, queryFile.position);
	}

	// Perform action on the selected suggestion.
	onChooseSuggestion(queryFile: QueryFile, evt: MouseEvent | KeyboardEvent) {
		void this.plugin.focusFile(queryFile.file.path);
	}


}
