# Polotno AI Rules

AI coding rules and assistant plugins for **Polotno SDK** — works with Claude Code, Cursor, GitHub Copilot, Codex, Windsurf, and more.

Gives your AI assistant knowledge of Polotno's Store API, Page API, Element types, UI components, customization patterns, and common gotchas.

## Setup

### Claude Code (recommended — richest experience)

Install the plugin for automatic skill loading and live documentation search via MCP:

```bash
claude plugin add polotno-project/polotno-ai-rules
```

This gives you:
- **Polotno SDK skill** — auto-triggered with API patterns and code examples
- **MCP documentation server** — live search of the latest Polotno docs
- Auto-updates on Claude Code startup

### All Other Platforms (one command)

```bash
npx polotno-ai-rules --all
```

This copies the appropriate rules files into your project root for every supported platform.

### Platform-Specific Setup

#### Cursor

```bash
npx polotno-ai-rules --cursor --mcp
```

Creates `.cursorrules` and `.mcp.json` in your project. Restart Cursor to pick up the rules.

#### GitHub Copilot

```bash
npx polotno-ai-rules --copilot
```

Creates `.github/copilot-instructions.md` in your project.

#### Codex / Jules / Aider

```bash
npx polotno-ai-rules --codex
```

Creates `AGENTS.md` in your project root (read automatically by Codex, Jules, and Aider).

#### Windsurf

```bash
npx polotno-ai-rules --windsurf
```

Creates `.windsurfrules` in your project.

### Manual Setup

If you prefer not to use the CLI, copy `rules/polotno-rules.md` from this repo to the appropriate location:

| Platform | Destination in your project |
|----------|---------------------------|
| Cursor | `.cursorrules` |
| Copilot | `.github/copilot-instructions.md` |
| Codex/Jules | `AGENTS.md` |
| Windsurf | `.windsurfrules` |

## What's Included

### Cross-Platform Rules

All platform files contain the same comprehensive Polotno SDK knowledge:

- **Store API** — `createStore`, pages, sizing, selection, grouping, undo/redo, JSON import/export, image/PDF/SVG/HTML/GIF export
- **Page API** — `addElement`, `set`, `clone`, `children`, sizing
- **Element types** — text, image, SVG, figure, line, video, group with full property examples
- **UI Components** — `Workspace`, `Toolbar`, `SidePanel`, `PagesTimeline`, `ZoomButtons`, `PolotnoContainer`
- **Customization** — custom side panels, images grids, toolbar components, custom fonts
- **Common gotchas** — `custom` attribute, `isAlive` guard, `waitLoading`, Blueprint CSS, MobX observer pattern

### Claude Code Plugin (additional features)

- **Dedicated skill** with detailed API reference and coding guidance
- **MCP server** for live Polotno documentation search
- Auto-triggered when working with Polotno code

## Source of Truth

All content is generated from `rules/polotno-rules.md`. Platform-specific files (`.cursorrules`, `AGENTS.md`, etc.) are not in the repo — they're generated at setup time by the CLI.

To update the rules, edit `rules/polotno-rules.md` and run `npm run build` to regenerate the Claude plugin's API reference.

## Documentation

- Full Polotno SDK docs: https://polotno.com/docs
- API keys: https://polotno.com/cabinet/

## License

MIT
