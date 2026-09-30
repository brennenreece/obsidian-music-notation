# obsidian-music-notation

An Obsidian plugin for rendering music notation and tablature from text-based markup (ABC notation, VexFlow, etc.) in code blocks, with iOS support.

## What it does

This plugin lets you write music notation directly in your Obsidian notes using a simple text-based format called **ABC notation**, and renders it as sheet music automatically. Because it's plain text, it works the same way on desktop *and* on iOS/mobile — no external files, images, or plugins with native binaries are required.

> **Note:** The current implementation renders [ABC notation](https://abcnotation.com/) via [abcjs](https://github.com/paulrosen/abcjs). VexFlow/LilyPond support (and richer tablature rendering) may be added in a future version, but is not implemented yet.

Example, write this in a note:

````markdown
```music
X:1
T:Example Tune
M:4/4
L:1/4
K:C
C D E F | G A B c |
```
````

...and it renders as sheet music wherever the note is viewed (desktop, iOS, Android).

## Project structure

```
.
├── main.ts                # Plugin source code (entry point)
├── manifest.json          # Obsidian plugin manifest (id, name, version, etc.)
├── versions.json          # Maps plugin versions to minimum required Obsidian version
├── package.json           # npm package metadata & scripts
├── tsconfig.json          # TypeScript compiler configuration
├── esbuild.config.mjs     # Build configuration (bundles main.ts -> main.js)
├── version-bump.mjs       # Helper script used by `npm run version`
├── styles.css             # Plugin styling, loaded automatically by Obsidian
└── .eslintrc              # Linting rules
```

After building, `main.js` is generated alongside `manifest.json` and `styles.css` — these three files are what Obsidian actually loads at runtime.

## Getting started (for beginners)

You don't need much TypeScript/JavaScript experience to get this running — just follow these steps.

1. **Install Node.js** (v16 or newer) from [nodejs.org](https://nodejs.org/) if you don't already have it.
2. **Clone this repository** (or download it) into a folder.
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Build the plugin**:
   ```bash
   npm run build
   ```
   This compiles `main.ts` into `main.js` using esbuild.
5. **Copy the plugin into your vault**. Create a folder named `obsidian-music-notation` inside your vault's `.obsidian/plugins/` directory, then copy `main.js`, `manifest.json`, and `styles.css` into it.
6. **Enable the plugin** in Obsidian: go to *Settings → Community plugins*, disable *Restricted mode* if needed, and turn on **Music Notation**.
7. Create a code block using the `music` language in any note (see the example above) and switch to reading view to see it rendered.

### Development mode

While actively developing, run:

```bash
npm run dev
```

This starts esbuild in watch mode, so `main.js` is rebuilt automatically every time you save `main.ts`. Reload Obsidian (or use a plugin like "Hot-Reload") to see your changes.

## How rendering works

The plugin registers a **Markdown code block processor** for blocks fenced with ```` ```music ```` (see `registerMarkdownCodeBlockProcessor` in `main.ts`). When Obsidian renders a note, any `music` code block's contents are passed to [abcjs](https://github.com/paulrosen/abcjs), which parses the ABC notation text and draws it as an SVG. Because abcjs is pure JavaScript (no native/desktop-only dependencies), the rendered notation works identically on iOS and other mobile platforms.

## iOS compatibility notes

- `manifest.json` sets `"isDesktopOnly": false` so the plugin is installable on Obsidian mobile.
- Only pure-JavaScript/TypeScript dependencies are used (no Node.js-only APIs, no native modules), which is required for the plugin to run inside Obsidian's mobile WebView.
- Rendering produces standard SVG elements, which iOS's WebView renders natively — no special handling is needed.
- Settings are stored via Obsidian's built-in `loadData`/`saveData` APIs, which work across all platforms.

## Settings

Open *Settings → Music Notation* to adjust:

- **Staff width** — width (in pixels) of the rendered staff.
- **Scale** — zoom level of the rendered notation.

## License

MIT
