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

	buildHighlighted(text: string, positions: number[], parentEl: HTMLElement) {
		let out = "";

		for (let i = 0; i < text.length; i++) {
			if (positions.includes(i)) {
				parentEl.createEl("span", {
					text: text[i],
					cls: "search-match"
				});
			} else {
				const character = text[i];
				if (character) {
					parentEl.appendText(character);
				}

			}
		}

		return out;
	}

	// Renders each suggestion item.
	renderSuggestion(queryFile: QueryFile, el: HTMLElement) {

		const title = el.createEl("div");
		title.classList.add("search-container");
		this.buildHighlighted(queryFile.file.basename, queryFile.position, title);
	}

	// Perform action on the selected suggestion.
	onChooseSuggestion(queryFile: QueryFile, evt: MouseEvent | KeyboardEvent) {
		void this.plugin.focusFile(queryFile.file.path);
	}


}
