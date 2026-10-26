---
name: polotno-sdk
description: >-
  Polotno SDK development assistant: store/page/element APIs, React UI
  components, customization patterns, and live documentation search. Use when
  adding a design, canvas, or image editor to a web app; building a Canva-like
  editor; adding templates, posters, or PNG/PDF export to a React app; working
  with a react-konva editor; or touching code that imports polotno. For
  producing designs from a brief, use the polotno-design skill instead.
  <example>user: "Add a Canva-like editor to our React dashboard." assistant:
  uses polotno-sdk to scaffold the editor.</example>
  <example>user: "Let users customize a poster template and download a PDF."
  assistant: uses polotno-sdk for templates and export.</example>
  <example>user: "How do I add a custom side panel in polotno?" assistant:
  uses polotno-sdk and looks up the docs.</example>
---

# Polotno SDK

Polotno is a JavaScript/React SDK for building canvas design editors, built on
Konva and react-konva: the canvas is Konva, and custom element types are React
components rendered with react-konva. State is MobX/MobX-State-Tree (bundled as
polotno dependencies — don't add your own `mobx`/`mobx-state-tree`). Since
**Polotno 4** the UI is Polotno's own design system; Blueprint is legacy
(`polotno/blueprint/*`, optional `@blueprintjs/*` peers) — only touch it when
migrating an old app. Install: `npm i polotno` for React 19,
`npm i polotno@react18` for React 18 (same code, React 18 build).

## Depth policy: look it up, don't guess

The SDK is large; this skill carries only the core model and a capability map.
For any specific method, prop, or option, **look up the current docs**:

1. Query the `polotno_documentation` MCP tool, e.g.
   `polotno_documentation("store export PDF options")`.
2. If that tool is unavailable, fetch the markdown version of the page:
   `https://polotno.com/docs/<page>.md` (index at https://polotno.com/llms.txt).
   Prefer these over the HTML pages.

Before saying something is impossible or hand-rolling it, scan `capabilities.md`
in this skill folder — it maps everything the SDK provides, with lookup hints.

## API key

Every store needs a key: `createStore({ key })`. Don't block on it:

- **Develop with the public demo key `nFA5H9elEytDyPyvKL7T`.** It works on
  `localhost` (any port; not `127.0.0.1`), CodeSandbox, StackBlitz, and headless/polotno-node,
  and is refused on any other domain. The canvas shows a "FREE TRIAL LICENSE"
  badge and a "Powered by polotno.com" credit (both hidden in exports).
- **Read the key from an env var** with the demo key as fallback, so going live
  is a config change, not a code change:
  `import.meta.env.VITE_POLOTNO_KEY`, `process.env.NEXT_PUBLIC_POLOTNO_KEY`, or
  `POLOTNO_API_KEY` on the server.
- **Own key, before deploying** (tell the user — it needs their account):
  1. Open https://polotno.com/cabinet and sign up / log in.
  2. In My Account, "Create your first API key" asks for the domain the editor
     will run on, e.g. `https://app.example.com` (`https://*.example.com`
     patterns work).
  3. Add more domains to the key as needed: `localhost:5173` (exact host:port)
     to test the own key locally, `headless` for polotno-node, `electron` for
     Electron apps. Domain changes take up to ~8 minutes to apply.
  4. Put the key in the env var above. Free keys keep the trial badge and
     credit; a paid plan removes them.
- **Reading the symptoms:** "LICENSE KEY IS MISSING" badge → no key passed;
  console "Current domain is not allowed" → add that origin to the key;
  "Polotno Free Version" in console → working key, not a paid plan. The editor
  keeps working in all of these cases.

## Quick start

```js
import { createStore } from 'polotno/model/store';

const store = createStore({
  key: import.meta.env.VITE_POLOTNO_KEY || 'nFA5H9elEytDyPyvKL7T', // demo key: localhost only
});
store.addPage();
```

```jsx
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { SidePanel } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { PagesTimeline } from 'polotno/pages-timeline';
import 'polotno/ui.css';
import 'polotno/fonts.css'; // optional: IBM Plex UI font, otherwise system font

const App = () => (
  <PolotnoContainer style={{ width: '100vw', height: '100vh' }}>
    <SidePanelWrap>
      <SidePanel store={store} />
    </SidePanelWrap>
    <WorkspaceWrap>
      <Toolbar store={store} />
      <Workspace store={store} />
      <ZoomButtons store={store} />
      <PagesTimeline store={store} />
    </WorkspaceWrap>
  </PolotnoContainer>
);
```

Shortcut without your own layout: `createPolotnoApp({ container, key, sections })`
from `polotno` mounts a full editor and returns `{ store, destroy }`.

**Next.js / SSR:** the editor needs the DOM. Put it in a `'use client'`
component and load that with `dynamic(() => import('./editor'), { ssr: false })`.

## Core model

- **store → pages → elements.** `createStore()` → `store.addPage()` →
  `page.addElement({ type, ... })`. Element types: `text`, `image`, `svg`,
  `figure`, `line`, `video`, `gif`, `table`, `group`.
- **Read directly, write via `set`.** Read `element.x`; update with
  `element.set({ x: 100 })`. Same for pages and store settings.
- **App data goes in `custom`.** Unknown properties are not part of the model
  and are lost on `toJSON()`/`loadJSON()`:
  `element.set({ custom: { myId: '12' } })`, read `element.custom?.myId`.
- **Global setup lives in `polotno/config`.** Call once at module scope, before
  rendering: `setUploadFunc` (real uploads — the default stores base64 in the
  JSON), `setTranslations`, `addGlobalFont`, `setGoogleFonts`, `setIcons`,
  `setColorsPresetFunc`, `onLoadError` (branch on `err.code`:
  `IMAGE_FAILED`, `FONT_FAILED`, `VIDEO_FAILED`, `EXPORT_FAILED`), feature flags,
  and custom element types via `unstable_registerShapeModel` +
  `unstable_registerShapeComponent` (register before `loadJSON`).
- **Autosave:** `const off = store.on('change', (json) => save(json))` fires
  with the full JSON on real changes; debounce it, call `off()` to stop.
- **MobX reactivity.** Wrap every React component that reads store/element
  state in `observer()` from `mobx-react-lite`.
- **`await store.waitLoading()`** before any export — images and fonts may
  still be loading.
- **Serialization.** `store.toJSON()` / `store.loadJSON(json)` round-trip the
  whole design; this JSON is also what templates and server-side rendering use.
  Validate or normalize it without the editor via the `@polotno/schema` package.
- **Custom UI matches the editor** when built from `polotno/primitives`
  (`Button`, `Input`, `Popover`, …) — they follow the editor theme, including
  dark mode.
- **Export from the store** renders through the mounted `<Workspace />` —
  exactly one must be on screen, or it throws `EXPORT_FAILED`
  (`workspace-not-mounted`). `await store.waitLoading()`, then
  `toDataURL()` / `toBlob()` / `saveAsImage()` for PNG/JPEG,
  `toPDFDataURL()` / `saveAsPDF()` for a **raster** PDF, `toGIFDataURL()` /
  `saveAsGIF()` for GIF. Everything else is a separate package working on the
  JSON (vector/print PDF, SVG, HTML, PPTX, MP4, imports, server rendering) —
  see the package table in `capabilities.md`.
- **MST `isAlive` guard.** A computed view that accesses a parent node
  (`getParent`) must check `isAlive(self)` first — MST destroys nodes
  synchronously, React unmounts asynchronously.
