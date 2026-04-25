import {App, PluginSettingTab} from "obsidian";
import SwitchFile from "./main";

export interface SwitchFileSettings {
	mySetting: string;
}

export const DEFAULT_SETTINGS: SwitchFileSettings = {
	mySetting: 'default'
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
	}
}
