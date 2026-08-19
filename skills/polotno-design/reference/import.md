# Importing existing files

Turn an existing file into an editable Polotno design. Import fidelity varies
by file. Always make a source proof and an imported proof.

| Format | Package | Runs in | Entry |
|---|---|---|---|
| PDF | `@polotno/pdf-import` | browser + Node | `pdfToJson({pdf})` |
| PSD | `@polotno/psd-import` | browser + Node | `psdToJson({psd})` |
| SVG | `@polotno/svg-import` | **browser only** (needs a DOM) | `svgToJson({svg})` |
| Figma | via SVG | browser only | export the frame as SVG (keep "Outline Text" OFF), then `svgToJson` |

Notes:

- The Polotno desktop app opens `.pdf` and `.svg` files directly — in the
  app runtime, just `open` the file instead of importing by hand.
- SVG import cannot run in plain Node scripts (no DOM). Headless runtime:
  hand the file to a browser context or the app, or tell the user.
- After an import, run schema validation and `lint`. Then render the result.
  Compare it with the source. Repair text fit, font, crop, and structure errors.

## Never claim

- PPTX **import** — not first-party yet (`@polotno/pptx-export`, the other
  direction, exists).
- IDML (InDesign) import — no supported path.
