import {App, Editor, MarkdownView, Modal, Notice, Plugin, TFile} from 'obsidian';
import {DEFAULT_SETTINGS, SwitchFileSettings, SwitchFileSettingsTab} from "./settings";
import {FileI, SearchModel} from "./SearchModel";

export default class SwitchFile extends Plugin {
	settings: SwitchFileSettings;
	cachedFiles: Map<FileI, number>
	fileIS: FileI[] = []
	lastOpenedList: FileI[] = [];


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


		//
		this.syncFiles();
		this.registerOtherEvents();
	}

	registerOtherEvents() {
		this.app.workspace.on('file-open', file => {
			if (!file) return
			const timestamp = Date.now();
			this.app.saveLocalStorage(file.path, String(timestamp));
		});
		// rename
		this.registerEvent(this.app.vault.on('rename', (file: TFile, oldPath: string) => {
			const timestamp = this.app.loadLocalStorage(oldPath) as string;
			// remove old one
			this.app.saveLocalStorage(oldPath, null);
			// add new one with old timestamp
			this.app.saveLocalStorage(file.path, String(timestamp));
		}));
		// delete
		this.registerEvent(this.app.vault.on('delete', (file: TFile) => {
			this.app.saveLocalStorage(file.path, null);
		}));
	}

	syncFiles() {
		this.app.vault.getFiles().map(file => {
			const newFile = this.convertFileToFileI(file);
			if (newFile) {
				console.debug('sync all file', file);
				this.fileIS.push(newFile);
			}
		})

		this.registerEvent(this.app.vault.on('create', (file: TFile) => {
			const newFile = this.convertFileToFileI(file);
			if (newFile) {
				console.debug('create', file);
				this.fileIS.push(newFile);
				this.cachedFiles.set(newFile, 0);
			}

		}));

		this.registerEvent(this.app.vault.on('rename', (file: TFile, oldPath: string) => {
			const removeFileI = this.fileIS.find(fileI => fileI.path === oldPath);
			if (!removeFileI) return
			// remove file
			this.fileIS.remove(removeFileI);
			// add new
			const newFile = this.convertFileToFileI(file);
			if (newFile) {
				console.debug('rename', file);
				this.fileIS.push(newFile);
				this.cachedFiles.set(newFile, 0);
			}

		}));

		this.registerEvent(this.app.vault.on('delete', (file: TFile) => {
			const newFile = this.convertFileToFileI(file);
			if (newFile) {
				console.debug('delete', file);
				this.fileIS.remove(newFile);
				this.cachedFiles.delete(newFile);
			}
		}));
	}

	getAllFiles() {
		console.debug('getAllFiles', this.fileIS);
		return this.fileIS;
	}

	convertFileToFileI(file: TFile, rank = 0, pined = false, lastOpened = ""): FileI | undefined {

		if (!file || file.extension !== 'md') return;
		return {
			name: file.basename,
			path: file.path,
			rank: rank,
			pined: pined,
			lastOpened: lastOpened
		}
	}

	async focusFile(path: string) {
		const targetFile = this.app.vault.getAbstractFileByPath(path)
		const currentLeaf = this.app.workspace.getMostRecentLeaf();
		if (currentLeaf && currentLeaf && targetFile instanceof TFile) {
			await currentLeaf.openFile(targetFile, {active: true});
		}
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

