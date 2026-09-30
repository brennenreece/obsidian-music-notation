import { Plugin, PluginSettingTab, App, Setting, Notice } from "obsidian";
import * as abcjs from "abcjs";

/**
 * Settings for the Music Notation plugin.
 *
 * `staffwidth` and `scale` control how the rendered notation looks.
 * These are intentionally simple so that beginners can tweak them
 * without needing to understand the full abcjs rendering API.
 */
interface MusicNotationSettings {
	staffwidth: number;
	scale: number;
}

const DEFAULT_SETTINGS: MusicNotationSettings = {
	staffwidth: 740,
	scale: 1.0,
};

/**
 * Main plugin class.
 *
 * Obsidian loads this class when the plugin is enabled. The
 * `onload()` method is where we register our code block processor,
 * which tells Obsidian how to render ```music code blocks.
 */
export default class MusicNotationPlugin extends Plugin {
	settings: MusicNotationSettings;

	async onload() {
		await this.loadSettings();

		// Register a processor for code blocks fenced with ```music
		// Example:
		// ```music
		// X:1
		// T:Example
		// M:4/4
		// L:1/4
		// K:C
		// C D E F | G A B c |
		// ```
		this.registerMarkdownCodeBlockProcessor("music", (source, el) => {
			this.renderMusic(source, el);
		});

		this.addSettingTab(new MusicNotationSettingTab(this.app, this));
	}

	onunload() {
		// Nothing to clean up manually; Obsidian removes any DOM
		// elements created by the code block processor automatically.
	}

	/**
	 * Renders ABC notation text into an SVG using abcjs and appends it
	 * to the provided container element.
	 */
	renderMusic(source: string, container: HTMLElement) {
		const wrapper = container.createDiv({ cls: "music-notation-render" });

		try {
			abcjs.renderAbc(wrapper, source, {
				responsive: "resize",
				staffwidth: this.settings.staffwidth,
				scale: this.settings.scale,
			});
		} catch (error) {
			console.error("Music Notation plugin: failed to render ABC notation", error);
			const message = error instanceof Error ? error.message : String(error);
			wrapper.createDiv({
				cls: "music-notation-error",
				text: `Unable to render music notation: ${message}`,
			});
			new Notice("Music Notation: failed to render code block. See console for details.");
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

/**
 * Settings tab shown under Settings -> Community Plugins -> Music Notation.
 */
class MusicNotationSettingTab extends PluginSettingTab {
	plugin: MusicNotationPlugin;

	constructor(app: App, plugin: MusicNotationPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Staff width")
			.setDesc("Width (in pixels) of the rendered music staff.")
			.addText((text) =>
				text
					.setPlaceholder("740")
					.setValue(String(this.plugin.settings.staffwidth))
					.onChange(async (value) => {
						const parsed = Number(value);
						if (!Number.isNaN(parsed) && parsed > 0) {
							this.plugin.settings.staffwidth = parsed;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("Scale")
			.setDesc("Zoom level of the rendered notation (1.0 = 100%).")
			.addText((text) =>
				text
					.setPlaceholder("1.0")
					.setValue(String(this.plugin.settings.scale))
					.onChange(async (value) => {
						const parsed = Number(value);
						if (!Number.isNaN(parsed) && parsed > 0) {
							this.plugin.settings.scale = parsed;
							await this.plugin.saveSettings();
						}
					})
			);
	}
}
