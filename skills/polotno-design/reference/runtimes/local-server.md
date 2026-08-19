# Runtime: local editor server (skill-carried)

No Polotno app installed, but you have a terminal and a human is present.
Start a small local server that shows the human a live editor in their
browser while you keep working on the file:

```bash
node scripts/serve.js design.json
```

The server installs missing npm packages. It checks for permitted updates at
most once every seven days. A change to a package version causes an editor
rebuild. The first build takes approximately 10 seconds. Then the server prints a
`http://localhost:<port>` URL. Give this URL to the user.
The page is a full Polotno editor bound to `design.json`. It reloads after a
file change. User edits save into the same file. This runtime
speaks the same verbs as `commands.md` — file-side, over your existing
scripts:

| Verb | How |
|---|---|
| create/read/patch design | edit `design.json` directly (validate after) |
| `render`, `export` | `node scripts/render.js …` (see `headless.md`) |
| schema validation | `node scripts/validate.js design.json` |
| `lint` | `node scripts/lint.js design.json` |

## Remote / cloud sandboxes

`localhost` here means *this machine* — if you run in a cloud sandbox, the
human's browser cannot reach it. In that case:

1. If your environment can expose a local port at a public URL (port
   forwarding, preview URLs), serve on that port and give the user the
   public URL instead.
2. Otherwise this runtime is unavailable — fall through to `headless.md`,
   and at the end hand the user the design JSON with one line: "import it
   at polotno.com/studio to edit."

Rules of the road:

- **Re-read before you write.** The human can save changes from the
  browser since your last read. Read `design.json` fresh before each edit,
  as with any shared file.
- Announce the URL once. Do not repeat it every turn.
- If `scripts/serve.js` is missing, your copy of the skill predates this
  runtime — fall through to `headless.md`.
- After the task ends, stop the server. Tell the user that the server stopped.
