import {App, Instruction, Notice, SuggestModal} from 'obsidian';
import SwitchFile from "./main";

export interface FileI {
	name: string;
	path: string;
	rank: number;
	lastOpened: string;
	pined: boolean;
}


export class SearchModel extends SuggestModal<FileI> {
	private plugin: SwitchFile;

	constructor(app: App, plugin: SwitchFile) {
		super(app);
		this.plugin = plugin;
		this.setPlaceholder('Search');
	}

	getSuggestions(query: string): FileI[] | Promise<FileI[]> {
		if (query === '') {
			return this.plugin.lastOpenedList.filter((file) =>
				file.name.toLowerCase().includes(query.toLowerCase())
			);
		}

		return this.plugin.getAllFiles().filter((file) =>
			file.name.toLowerCase().includes(query.toLowerCase())
		);
	}

	// Renders each suggestion item.
	renderSuggestion(file: FileI, el: HTMLElement) {

		el.createEl('div', {text: file.name});
		// el.createEl('small', {text: file.path});
	}

	// Perform action on the selected suggestion.
	onChooseSuggestion(file: FileI, evt: MouseEvent | KeyboardEvent) {
		void this.plugin.focusFile(file.path);
	}


}
