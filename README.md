# Polotno AI Skills

Agent skills for **Polotno** — installable knowledge packs that teach your AI assistant (Claude Code, Cursor, Codex, Copilot, Windsurf, and more) how to build with Polotno SDK and how to generate Polotno designs.

## The Skills

| Skill | What it does | Use it when |
|-------|--------------|-------------|
| **polotno-sdk** | Polotno SDK development assistant — Store/Page/Element APIs, React UI components, customization patterns, common gotchas, plus live documentation search via MCP | You're embedding or customizing a Polotno canvas editor in your app |
| **polotno-design** | Headless design generation — produce a Polotno JSON design from a text brief, render it to PNG/PDF, iterate visually against a design rubric, and bulk-generate variants from data (CSV/list) | You want the agent to create posters, social posts, ads, flyers, or marketing images — no editor UI involved |

Both skills live in [`skills/`](skills/), one folder per skill with a `SKILL.md` entry point.

## Install

### Claude Code (recommended)

The plugin gives you both skills plus a live documentation MCP server:

```bash
# 1. Add the marketplace
claude plugin marketplace add polotno-project/skills

# 2. Install the plugin
claude plugin install polotno@polotno
```

Or from within a Claude Code session:

```
/plugin marketplace add polotno-project/skills
/plugin install polotno@polotno
```

This gives you:
- Both skills, auto-triggered when relevant
- **MCP documentation server** — live search of the latest Polotno docs
- Auto-updates on Claude Code startup

### All other platforms

Install with the [skills](https://github.com/vercel-labs/skills) CLI — it supports 40+ AI coding agents including Cursor, Copilot, Codex, Windsurf, and Cline, auto-detects which ones you have, and converts the skills to each agent's native format:

```bash
npx skills add polotno-project/skills
```

### Manual setup

Copy the skill content into your agent's instructions file:

- SDK knowledge: [`skills/polotno-sdk/SKILL.md`](skills/polotno-sdk/SKILL.md) and its [`capabilities.md`](skills/polotno-sdk/capabilities.md)
- Design generation: [`skills/polotno-design/SKILL.md`](skills/polotno-design/SKILL.md) (also needs its `scripts/` and `reference/` folders alongside it)

| Platform | Instructions file |
|----------|-------------------|
| Cursor | `.cursorrules` |
| Copilot | `.github/copilot-instructions.md` |
| Codex / Jules | `AGENTS.md` |
| Windsurf | `.windsurfrules` |

### Recommended: live docs search (MCP)

The sdk skill is designed to look up API details in the live Polotno docs. The Claude Code plugin ships this MCP server automatically. On other MCP-capable agents (Cursor, Codex, Windsurf, …), add it to your MCP config:

```json
{
  "mcpServers": {
    "polotno-documentation": {
      "command": "npx",
      "args": [
        "crawl-chat-mcp",
        "--id=67e312247a822a2303f2b8a7",
        "--name=polotno_documentation"
      ]
    }
  }
}
```

Without it, the skill falls back to fetching https://polotno.com/docs directly.

## Notes on the design skill

`polotno-design` runs a closed visual loop: generate JSON → render → the agent *looks* at the render → critique against a rubric → fix → repeat. It works best in agents with terminal access and vision (Claude Code). It needs Node.js, and rendering/asset search use a Polotno API key — the bundled scripts fall back to a rate-limited public demo key, so set your own for real use:

```bash
export POLOTNO_API_KEY=...   # https://polotno.com/cabinet
```

## Maintaining

Skills are edited directly under `skills/` — each skill is self-contained. The sdk skill is `SKILL.md` (core model) + `capabilities.md` (feature map); the design skill's behavior lives in its `SKILL.md`, `reference/`, and `scripts/`.

## Documentation

- Full Polotno SDK docs: https://polotno.com/docs
- API keys: https://polotno.com/cabinet/

## License

MIT
