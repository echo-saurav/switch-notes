import {App, PluginSettingTab, Setting} from "obsidian";
import SwitchFile from "./main";

export interface SwitchFileSettings {
	ignoreFolders: string
	doNotSuggestFolders: string
	maxResults: number;
}

export const DEFAULT_SETTINGS: SwitchFileSettings = {
	ignoreFolders: '',
	doNotSuggestFolders: '',
	maxResults: 10
}

export class SwitchFileSettingsTab extends PluginSettingTab {
	plugin: SwitchFile;

	constructor(app: App, plugin: SwitchFile) {
		super(app, plugin);
		this.plugin = plugin;
	}



	display(): void {
		const {containerEl} = this;
		containerEl.empty();
		containerEl.empty();

		new Setting(containerEl)
			.setName("Ignore folders")
			.setDesc(
				"Add folders name , add multiple folders split by ','"
			)
			.addText((text) =>
				text
					.setPlaceholder("Ignore folders")
					.setValue(this.plugin.settings.ignoreFolders)
					.onChange(async (value) => {
						this.plugin.settings.ignoreFolders = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Do not suggest folders")
			.setDesc(
				"Add folders name , add multiple folders split by ','"
			)
			.addText((text) =>
				text
					.setPlaceholder("Do not suggest folders")
					.setValue(this.plugin.settings.doNotSuggestFolders)
					.onChange(async (value) => {
						this.plugin.settings.doNotSuggestFolders = value;
						await this.plugin.saveSettings();
					})
			);


		new Setting(containerEl)
			.setName("Max results")
			.setDesc(
				"Max notes to show when searched"
			)
			.addText((text) =>
				text
					.setPlaceholder("10")
					.setValue(String(this.plugin.settings.maxResults))
					.onChange(async (value) => {
						this.plugin.settings.maxResults = Number(value);
						await this.plugin.saveSettings();
					})
			);

	}
}
