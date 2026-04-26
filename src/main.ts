import {App, Editor, MarkdownView, Modal, Notice, Plugin, TFile} from 'obsidian';
import {DEFAULT_SETTINGS, SwitchFileSettings, SwitchFileSettingsTab} from "./settings";
import {FileI, QueryFile, SearchModel} from "./SearchModel";

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

		this.registerEvents();
	}

	// keep updated last opening timestamp
	registerEvents() {
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

	searchFiles(query: string) {
		const files = this.app.vault.getMarkdownFiles();
		const matchedFiles: QueryFile[] = []

		files.map(file => {
			const positions = this.fuzzyMatch(file.name, query);
			let score = 0;

			if (file.name.startsWith(query)) {
				score = 2;
			} else {
				score = 1;
			}
			// set a recency score
			if (positions) {
				score = score + Number(this.app.loadLocalStorage(file.path));
				//
				matchedFiles.push({
					file:file,
					score: score,
					position: positions
				});
			}
		})

		matchedFiles.sort((a, b) => b.score - a.score);
		return matchedFiles;
	}

	fuzzyMatch(text: string, query: string) {
		let t = 0, q = 0;
		let positions: number[] = []
		text = text.toLowerCase().trim();
		query = query.toLowerCase().trim();


		while (t < text.length && q < query.length) {
			if (text[t] === query[q]) {
				q++
				positions.push(t);
			}
			if (text[t] === query[q]) q++;
			t++;
		}


		if (q === query.length) {
			return positions;
		} else {
			return false
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

