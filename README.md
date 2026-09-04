# Polotno AI Skills

Agent skills for **Polotno** — installable knowledge packs that teach your AI assistant (Claude Code, Cursor, Codex, Copilot, Windsurf, and more) how to build with Polotno SDK and how to generate Polotno designs.

Quickest start — paste this into any agent:

```
Read https://polotno.com/skills/design.md and follow it.
```

## The Skills

| Skill | What it does | Use it when |
|-------|--------------|-------------|
| **polotno-sdk** | Polotno SDK development assistant for APIs, React components, customization, and live documentation search | You embed or customize a Polotno editor |
| **polotno-design** | Design production through the best available Polotno runtime. It produces editable JSON, makes visual proofs, exports PNG or PDF, and creates data variants. | You want the agent to create posters, social posts, ads, flyers, invitations, or print PDFs |

Both skills live in [`skills/`](skills/), one folder per skill with a `SKILL.md` entry point.

## Install and update

### Claude Code

The plugin gives you both skills plus a live documentation MCP server:

```bash
claude plugin marketplace add polotno-project/skills
claude plugin install polotno@polotno
```

Or from within a Claude Code session:

```
/plugin marketplace add polotno-project/skills
/plugin install polotno@polotno
```

The plugin provides both skills and a live documentation MCP server.

Run this command to update an installed plugin:

```bash
claude plugin update polotno@polotno
```

Claude Code disables automatic updates for third-party marketplaces by default.
Use `/plugin`, select **Marketplaces**, and enable automatic updates if you want them.

After an update, start a new session or run `/reload-plugins`.

### ChatGPT desktop app and Codex

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add polotno-project/skills
codex plugin add polotno@polotno
```

This plugin contains skills only. It does not start the optional documentation MCP server.

After an update, start a new thread. Restart the ChatGPT desktop app if it does not load the new version.

Run these commands to update the marketplace and reinstall the current plugin:

```bash
codex plugin marketplace upgrade polotno
codex plugin add polotno@polotno
```

### Other agents

Use the [skills CLI](https://github.com/vercel-labs/skills) with supported agents, such as Cursor, Copilot, Windsurf, and Cline:

```bash
npx skills add polotno-project/skills
```

This installs both skills: `polotno-sdk` for developers integrating the editor and `polotno-design` for producing designs. Add `--skill <name>` to install one of them.

Run this command to update installed skills:

```bash
npx skills update
```

### Manual setup

Copy the complete skill directory into your agent's skill directory.
Keep each `SKILL.md` file with its referenced files and scripts.

If your agent accepts only text, copy `SKILL.md` and its referenced Markdown files.
In that case, bundled scripts are unavailable.

### Recommended: live docs search (MCP)

The SDK skill looks up current API details in the live Polotno documentation.
The Claude Code plugin includes this MCP server.

For another MCP-compatible agent, add the server to its MCP configuration:

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

`polotno-design` uses this production flow: delivery contract → composition → preflight → visual proof → repair → package. It selects a connected desktop app, a local browser editor, or headless scripts. Terminal and image-view access give the best results. Headless rendering and asset search need Node.js and a Polotno API key. If no key is set, the scripts use a public demo key:

```bash
export POLOTNO_API_KEY=...   # https://polotno.com/cabinet
```

## Maintaining

Edit skills directly under `skills/`. Each skill is self-contained. The SDK
skill uses `SKILL.md` and `capabilities.md`. The design skill also uses its
`reference/` and `scripts/` folders.

## Documentation

- Full Polotno SDK docs: https://polotno.com/docs
- API keys: https://polotno.com/cabinet/

## License

MIT
