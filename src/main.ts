import {App, Editor, MarkdownView, Modal, Notice, Plugin, TFile} from 'obsidian';
import {DEFAULT_SETTINGS, SwitchFileSettings, SwitchFileSettingsTab} from "./settings";
import {QueryFile, SearchModel} from "./SearchModel";

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

		this.registerEvents();
	}

	searchFiles(query: string) {
		const files = this.app.vault.getFiles();
		const matchedFiles: QueryFile[] = []

		files.map(file => {
			//
			let ignoredFolder = false;
			let doNotSuggestFolders = false;
			const openedFilePath = this.getCurrentOpenFilePath();
			if (openedFilePath && file.path === openedFilePath) {
				return;
			}

			// ignore - keep low score
			this.settings.ignoreFolders.split(',').forEach((folder) => {
				if (file.path.startsWith(folder)) {
					ignoredFolder = true;
				}
			});

			// do not suggest
			if (this.settings.doNotSuggestFolders) {

				this.settings.doNotSuggestFolders.split(',').forEach((folder) => {
					if (file.path.startsWith(folder)) {
						doNotSuggestFolders = true;
					}
				});
			}

			if (doNotSuggestFolders) {
				return;
			}


			//
			const fuzzyResult = this.fuzzyMatch(file.name, query);
			const positions = fuzzyResult.positions;


			let score = 0;
			// TODO
			// start with
			// 100
			// matched full word
			// 90
			// partial match
			// 50
			// Day
			// Opened 1 days ago
			// 70
			// Opened 7 days ago
			// 50
			// Opened 30 days ago
			// 30
			// ignore folder
			// -100
			// doNotSuggestFolders


			// start with has high rank
			if (file.name.startsWith(query)) {
				score = 1000;
			} else {
				score = 1;
			}
			// set a recency score
			if (positions) {
				score = score + this.lastOpenedDayScore(file) + fuzzyResult.score;
				if (ignoredFolder) {
					score = score - 1000;
				}
				matchedFiles.push({
					file: file,
					score: score,
					position: positions
				});
			}
		})

		matchedFiles.sort((a, b) => b.score - a.score);
		return matchedFiles.splice(0, this.settings.maxResults);
	}

	lastOpenedDayScore(file: TFile) {
		let timestamp = Number(this.app.loadLocalStorage(file.path));

		if (timestamp <= 0) {
			timestamp = file.stat.mtime
		}

		const current_timestamp = Date.now();
		const diff = current_timestamp - timestamp;
		const days = diff / (1000 * 60 * 60 * 24)

		// reduce score based on how far the day is

		if (days > 0) {
			return 10 / days;
		} else if (days > 20) {
			return 20 / days;
		} else if (days > 30) {
			return 30 / days;
		} else {
			return 50 / days;
		}

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


	fuzzyMatch(text: string, query: string) {
		let t = 0, q = 0;
		let positions: number[] = []
		text = text.toLowerCase().trim();
		query = query.toLowerCase().trim();
		//
		// let score = 0;
		let charMatched = 0;
		let gap = true;


		while (t < text.length && q < query.length) {
			if (text[t] === query[q]) {
				q++
				positions.push(t);
				// adding score
				if (gap && t > charMatched) {
					// score = score + 300;
					charMatched++;
				}
			} else {
				gap = true;
			}
			t++;
		}
		let score = 0;
		if (query.length === charMatched) {
			score = 1000;
		} else if (query.length / charMatched > .5) {
			score = 400;
		} else if (charMatched === 1) {
			score = 1;
		}

		if (q === query.length) {
			return {
				positions: positions,
				score: score
			}

		} else {
			return {
				positions: null,
				score: 0
			}
		}

	}


	async focusFile(path: string) {
		const targetFile = this.app.vault.getAbstractFileByPath(path)
		const currentLeaf = this.app.workspace.getMostRecentLeaf();
		if (currentLeaf && currentLeaf && targetFile instanceof TFile) {
			await currentLeaf.openFile(targetFile, {active: true});
		}
	}

	getCurrentOpenFilePath() {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const path = view?.file?.path
		if (path) {
			return path
		}
		return null
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

