import {App, Instruction, Notice, SuggestModal} from 'obsidian';
import SwitchFile from "./main";

export interface FileInterface {
	name: string;
	path: string;
}


export class SearchModel extends SuggestModal<FileInterface> {
	private plugin: SwitchFile;

	constructor(app: App, plugin: SwitchFile) {
		super(app);
		this.plugin = plugin;
		this.setPlaceholder('Search');
		this.setInstructions([
			{
				command:'cmd+x',
				purpose:'search',
			},
			{
				command:'cmd+x',
				purpose:'search',
			}
		])
	}

	getSuggestions(query: string): FileInterface[] | Promise<FileInterface[]> {


		return this.plugin.getAllFiles().filter((file) =>
			file.name.toLowerCase().includes(query.toLowerCase())
		);
	}

	// Renders each suggestion item.
	renderSuggestion(file: FileInterface, el: HTMLElement) {
		el.createEl('div', {text: file.name});
		el.createEl('small', {text: file.path});
	}

	// Perform action on the selected suggestion.
	onChooseSuggestion(file: FileInterface, evt: MouseEvent | KeyboardEvent) {
		new Notice(`Selected ${file.name}`);
	}



}
