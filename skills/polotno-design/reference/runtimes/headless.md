# Runtime: headless (scripts)

No app, no human watching, or a bulk/unattended job. Everything runs from
the terminal against `design.json` files.

The validation and rendering scripts install missing npm packages. They check
for permitted updates at most once every seven days. The state file contains
the time and result of the last check. The file is at
`scripts/node_modules/.polotno-dependencies.json`. If an update fails, the
scripts use the installed packages. Set `POLOTNO_DEPENDENCY_UPDATE=never` to
disable update checks.

Rendering and asset search need a Polotno key. The scripts bundle a public
demo key; set your own to use it instead:

```bash
export POLOTNO_API_KEY=...   # https://polotno.com/cabinet
```

## Verb → script map

| Verb | How |
|---|---|
| create/read/patch design | edit `design.json` directly |
| schema validation | `node scripts/validate.js design.json` (read-only partial validation) |
| `lint` | `node scripts/lint.js design.json` (placeholders, ids, fonts, bounds, text fit, assets, coverage, print) |
| `render` (preview) | `node scripts/render.js design.json preview.png` (~512px) |
| `export` | `node scripts/render.js design.json out.png --full` · `out.pdf --pdf` · `--page <id>` |
| assets | `node scripts/resolve-assets.js search photo "…"` — look, pick, paste the url. Icons: `search icon "…"` then `get icon <id>` → paste the data URL. `resolve` mode auto-picks for unattended runs |

Print options for `--pdf` (dpi, units, bleed, crop marks) and the vector /
CMYK / PDF-X story live in `print-pdf.md` — read it before promising any
print output.

If a font cannot load, `render.js` stops. Correct the font source before you
make a new proof or final export.

## No local Chromium? Cloud Render API

`render.js` runs a headless Chromium via polotno-node. If the machine
cannot run one, the Cloud Render API renders the same JSON server-side
(paid key required):

```bash
curl -s -X POST "https://api.polotno.com/api/renders?KEY=$POLOTNO_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"design": <design.json contents>, "format": "png"}'
# → {"id": "..."}
# Poll:
curl -s "https://api.polotno.com/api/renders/<id>?KEY=$POLOTNO_API_KEY"
# → {"status": "done", "output": "<url, valid 7 days>"}
```

Formats: png, jpeg, pdf, gif, mp4. Print options: see `print-pdf.md`.
Full docs: https://polotno.com/docs/cloud-render-api

## Bulk variants

Copy the source template for each data row. Fill each `custom.slot` element.
Run `validate.js` and `lint.js`. Then run `render.js … --full` for each output.
Name outputs from a stable row key. Report each failed row.

## If you cannot view images

You cannot run the loop. Author and validate the JSON, render once, and
tell the user that visual proof was not possible. Do not describe an unseen
render as correct.
