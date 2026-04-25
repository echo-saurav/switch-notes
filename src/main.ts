import {App, Editor, MarkdownView, Modal, Notice, Plugin, TFile} from 'obsidian';
import {DEFAULT_SETTINGS, SwitchFileSettings, SwitchFileSettingsTab} from "./settings";
import {FileInterface, SearchModel} from "./SearchModel";

export default class SwitchFile extends Plugin {
	settings: SwitchFileSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SwitchFileSettingsTab(this.app, this));

		this.addCommand({
			id: 'open-modal-search',
			name: 'Search note',
			callback: () => {
				new SearchModel(this.app, this).open();
			}
		});
	}

	getAllFiles() {
		const files = this.app.vault.getFiles();
		const limitFiles: TFile[] = files.length > 10 ? files : files.splice(0, 10);
		let filesInterface: FileInterface[] = [];

		limitFiles.map((file: TFile) => {
			filesInterface.push({name: file.basename, path: ""});
		})
		return filesInterface;

	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<SwitchFileSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

