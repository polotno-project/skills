---
name: polotno-sdk
description: >-
  Polotno SDK development assistant — store/page/element APIs, React UI
  components, customization patterns, and live documentation search. Use when
  building or customizing a Polotno canvas editor in an app: code that imports
  polotno, side panels, toolbars, workspace, export. For generating designs
  headlessly from a brief, use the polotno-design skill instead.
---

# Polotno SDK

Polotno is a JavaScript/React SDK for building canvas design editors. State is
MobX/MobX-State-Tree. Since **Polotno 4** the UI is Polotno's own design system —
Blueprint.js is deprecated. Two release lines: **4.x** = React 19 (`npm i polotno`),
**3.x** = React 18.

## Depth policy: look it up, don't guess

The SDK is large; this skill carries only the core model and a capability map.
For any specific method, prop, or option, **look up the current docs**:

1. Query the `polotno_documentation` MCP tool, e.g.
   `polotno_documentation("store export PDF options")`.
2. If that tool is unavailable, fetch the same content from
   https://polotno.com/docs.

Before saying something is impossible or hand-rolling it, scan `capabilities.md`
in this skill folder — it maps everything the SDK provides, with lookup hints.

## Quick start

```js
import { createStore } from 'polotno/model/store';

const store = createStore({ key: 'YOUR_API_KEY' }); // https://polotno.com/cabinet/
const page = store.addPage();
```

```jsx
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { SidePanel } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { PagesTimeline } from 'polotno/pages-timeline';
import 'polotno/ui.css'; // Polotno 4+. (Polotno 2/3 used @blueprintjs css)

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

## Core model

- **store → pages → elements.** `createStore()` → `store.addPage()` →
  `page.addElement({ type, ... })`. Element types: `text`, `image`, `svg`,
  `figure`, `line`, `video`, `gif`, `table`, `group`.
- **Read directly, write via `set`.** Read `element.x`; update with
  `element.set({ x: 100 })`. Same for pages and store settings.
- **App data goes in `custom`.** Arbitrary properties are silently ignored:
  `element.set({ custom: { myId: '12' } })`, read `element.custom?.myId`.
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
- **MST `isAlive` guard.** A computed view that accesses a parent node
  (`getParent`) must check `isAlive(self)` first — MST destroys nodes
  synchronously, React unmounts asynchronously.
