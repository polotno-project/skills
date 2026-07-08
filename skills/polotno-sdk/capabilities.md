# Polotno SDK — capability map

What the SDK provides, area by area. Breadth, not depth: use this to know a
feature exists, then look up details via the `polotno_documentation` MCP tool
(or https://polotno.com/docs). Each section ends with an example lookup query.

## Editor UI components

`PolotnoContainer` + `SidePanelWrap`/`WorkspaceWrap` layout; `Workspace`
(canvas), `Toolbar`, `SidePanel`, `PagesTimeline`, `ZoomButtons`. Each is
independently replaceable — you can use only the canvas and build the rest.
*Ask: "Workspace component props".*

## Side panel customization

- Compose `sections` from `DEFAULT_SECTIONS` plus your own `{ name, Tab, Panel }`
  sections; `SectionTab` for tabs, `defaultSection` to control the initial one.
- `ImagesGrid` + `useInfiniteAPI` for image/template lists from your backend;
  custom images panel, upload panel (default upload is base64-only — production
  apps should implement their own), background panel, resize panel.
- Hide/remove default sections; built-in hidden panels: `effects`, `animation`,
  `image-clip` (`store.openSidePanel(name)`).
*Ask: "custom side panel section" or "upload panel backend".*

## Toolbar, tooltip, workspace chrome

Override or add toolbar controls per element type via the `components` prop;
customize the floating tooltip; style canvas chrome (selection rect, snap/
distance guides, transformer, page controls) via `Workspace` props. The
`PagesTimeline` is not customizable — remove it and build your own if needed.
*Ask: "toolbar components override" or "workspace canvas styling props".*

## Theming

`import 'polotno/ui.css'`; recolor via CSS variables (`--primary`, `--radius`, …
or `--pn-*` to scope to the editor only); dark mode via `dark` class or
`data-polotno-theme="dark"`; prebuilt themes (`polotno/themes/*.css`); stable
`polotno-*` CSS selectors; `setIcons()` to swap any editor icon;
`polotno/primitives` for building matching custom UI.
*Ask: "theme CSS variables dark mode".*

## Store & data

- Pages: add, clone, select, reorder, delete; per-page size, background,
  `duration` (for video), bleed with per-side overrides.
- Canvas size: `store.setSize(w, h, useMagicResize)` — magic resize rescales
  content; units (`px/pt/mm/cm/in`) + dpi for print UI.
- Selection (`selectedElements`, `selectElements`), grouping, z-order,
  `getElementById`, `deleteElements`.
- History: `store.history.undo()/redo()`, `canUndo/canRedo`.
- Roles: `store.setRole('user' | 'admin' | 'viewer')` for read-only or admin UIs.
- Tools: `store.setTool('draw')` freehand drawing with stroke options.
- UI state: open side panels, zoom (`setScale`), rulers, bleed, distance guides.
*Ask: "store API <topic>".*

## Elements

Common: position/size/rotation/opacity, effects (shadow, blur, brightness),
locking flags (`draggable`, `contentEditable`, `styleEditable`, `resizable`,
`removable` → computed `element.locked`), `alwaysOnTop`, `showInExport`.

- **text** — fonts, align, spacing, stroke, background; rich text (Polotno 4):
  font family/size/style per fragment; `toggleEditMode()`. Note: `placeholder`
  text renders in exports too — fill or remove before exporting.
- **image** — smart crop (`cropX/Y/Width/Height`), `clipSrc` masks/frames,
  borders, corner radius, flips, filters; `toggleCropMode()`.
- **svg** — recolor via `replaceColor()` / `colorsReplace`, `resetColors()`.
- **figure** — shapes via `subType` (rect, circle, star, …), fill/stroke/radius.
- **line** — dash patterns, arrow heads.
- **video** — trim (start/end), behaves as a normal layer.
- **gif**, **table**, **group** (groups can own animations in Polotno 4).
*Ask: "text element properties" or "image crop clipSrc".*

## Import

`store.loadJSON()`; SVG import, PDF import, PSD import (convert files into
editable designs). *Ask: "PSD import".*

## Export

- Images: `toDataURL()`, `toBlob()` (faster), `saveAsImage()`; `pixelRatio`
  for resolution, `pageId` for one page, JPEG/PNG.
- PDF: `toPDFDataURL()`, `saveAsPDF()` — dpi, bleed + crop marks, units.
- Animation/video: GIF export, MP4 video export, audio mixed in.
- Also HTML, SVG, PPTX (PowerPoint) export.
*Ask: "export PDF bleed crop marks" or "video export mp4".*

## Design format & validation

Every design is plain JSON (`store.toJSON()` ⇄ `store.loadJSON()`) — the Design
Format, currently schemaVersion 4. The **`@polotno/schema`** package works with
it without the editor (DOM-free — servers, edge functions, LLM pipelines):
`validateDesign(json, { mode: 'partial' | 'canonical' })` returns
`{ valid, errors: [{ path, message }] }`; `normalizeDesign(partial)` fills
defaults; TypeScript types (`Design`, `TextElement`, …); and a published
`design.schema.json` to use as an LLM structured-output schema, validating
generated designs before `loadJSON` or server rendering.
*Ask: "schema package validate design".*

## Server-side & automation

- **polotno-node** — headless rendering in Node.js: `createInstance({ key })`,
  `jsonToImageBase64(json)`, `instance.run()` for arbitrary store code; errors
  carry structured codes (`IMAGE_FAILED`, `FONT_FAILED`, `DESIGN_INVALID`).
- **Cloud Render API** — managed HTTP rendering of Polotno JSON to image, GIF,
  PDF, MP4; no infrastructure, batch-friendly.
- **Templates library pattern** — designs are just JSON: save `store.toJSON()`
  as templates, render previews server-side, list them in a custom side panel,
  `loadJSON()` on click.
*Ask: "polotno-node options" or "cloud render api".*

## Animations, video & audio

Schema-driven animations on any element (move, fade, zoom, rotate, blink,
bounce; duration/delay/easing), group animations, page `duration`, playback
control (`store.play()`, `setCurrentTime`), global timeline UI, audio tracks
(`store.addAudio({ src, volume, delay, startTime, endTime })`).
*Ask: "animations api" or "audio support".*

## Fonts

Google Fonts built in (list is customizable); design fonts (stored in JSON) vs
global fonts (`addGlobalFont`) for app-wide brand fonts; font upload config;
server-side font notes for rendering consistency.
*Ask: "custom fonts global vs design".*

## Configuration & assets

Editor configuration: upload handling, translations/localization, color
presets, Google Fonts list; asset loading behavior (timeouts, error handling,
CORS); image downscaling quality.
*Ask: "editor configuration" or "asset loading".*

## Frameworks & environments

React 19 (4.x) / React 18 (3.x); Next.js (client components), Vue, Angular,
frameworkless/non-React usage, iOS Swift (WebView), drop-in `createDemoApp`
/ Polotno Button; Polotno 4 migration guide (Blueprint → new UI).
*Ask: "next.js integration" or "polotno 4 migration".*
