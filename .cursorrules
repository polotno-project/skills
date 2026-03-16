# Polotno SDK — AI Coding Rules

You are working with **Polotno SDK**, an opinionated JavaScript library and set of React components for building canvas editors. It uses MobX/MobX-State-Tree for state management and Blueprint.js for UI.

## Quick Start

```js
import { createStore } from 'polotno/model/store';

const store = createStore({
  key: 'YOUR_API_KEY', // https://polotno.com/cabinet/
  showCredit: true,
});
const page = store.addPage();
```

```jsx
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { PagesTimeline } from 'polotno/pages-timeline';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import '@blueprintjs/core/lib/css/blueprint.css';

const App = () => (
  <PolotnoContainer style={{ width: '100vw', height: '100vh' }}>
    <SidePanelWrap>
      <SidePanel store={store} />
    </SidePanelWrap>
    <WorkspaceWrap>
      <Toolbar store={store} downloadButtonEnabled />
      <Workspace store={store} />
      <ZoomButtons store={store} />
      <PagesTimeline store={store} />
    </WorkspaceWrap>
  </PolotnoContainer>
);
```

## Store API

### Creating & Configuration

```js
import { createStore } from 'polotno/model/store';
const store = createStore({ key: 'YOUR_API_KEY', showCredit: true });
```

### Pages

```js
const page = store.addPage();                          // add empty page
const page = store.addPage({ background: 'grey' });    // with background
store.pages;                                            // all pages
store.activePage;                                       // current active page
store.selectPage(store.pages[1].id);                   // focus a page
store.deletePages([store.activePage.id]);               // remove pages
store.clear();                                          // remove all pages
```

### Canvas Size

```js
store.setSize(1080, 1080);                  // set page size
store.setSize(1080, 1080, true);            // with magic resize (auto-adjust elements)
store.setUnit({ unit: 'mm', dpi: 300 });    // unit metrics for UI
```

### Selection

```js
store.selectedElements;                     // array of selected elements
store.selectElements([el1.id, el2.id]);     // select elements
store.selectElements([]);                   // clear selection
store.getElementById('some-id');            // find element by id
```

### Grouping

```js
store.groupElements([el1.id, el2.id]);      // group elements
store.ungroupElements([group.id]);          // ungroup
```

### Undo/Redo

```js
store.history.undo();
store.history.redo();
```

### Import/Export JSON

```js
const json = store.toJSON();                // serialize entire store
store.loadJSON(json);                       // load from JSON
await store.waitLoading();                  // wait for all assets to load
```

### Export Images

```js
const url = await store.toDataURL();
const url = await store.toDataURL({ pixelRatio: 2 });                    // higher quality
const url = await store.toDataURL({ mimeType: 'image/jpeg' });           // JPEG
await store.saveAsImage({ fileName: 'design.png' });
const blob = await store.toBlob({ pixelRatio: 2 });                      // faster than toDataURL
```

### Export PDF

```js
const pdfUrl = await store.toPDFDataURL();
const pdfUrl = await store.toPDFDataURL({ pixelRatio: 2, includeBleed: true, cropMarkSize: 20, unit: 'mm' });
await store.saveAsPDF({ fileName: 'design.pdf', dpi: 300 });
```

### Export SVG/HTML/GIF

```js
const svg = await store.toSVG();
const html = await store.toHTML();
const gif = await store.toGIFDataURL({ fps: 10 });
```

### High-Quality Export

```js
store.setElementsPixelRatio(2);
const url = await store.toDataURL({ pixelRatio: 2 });
```

### UI Control

```js
store.openSidePanel('templates');           // open side panel by name
store.setScale(2);                          // zoom level
store.toggleBleed();                        // show/hide bleed area
store.toggleRulers();                       // show/hide rulers
store.setRole('admin');                     // set user role
```

## Page API

```js
const page = store.addPage({ background: 'grey' });

page.set({
  background: 'red',                        // CSS color or image URL
  custom: { myId: 'some-id' },              // app-specific data
  bleed: 10,                                // bleed in pixels
  width: 1000,                              // 'auto' to inherit from store
  height: 1000,
});

page.setSize({ width: 1000, height: 1000, useMagic: true });
page.clone();                               // duplicate page
page.setZIndex(0);                          // reorder pages
page.children;                              // array of elements
```

## Element Types & Properties

All elements share: `x`, `y`, `rotation`, `width`, `height`, `opacity`, `name`, `visible`, `selectable`, `draggable`, `contentEditable`, `styleEditable`, `resizable`, `removable`, `alwaysOnTop`, `showInExport`, `custom`.

### Text Element

```js
page.addElement({
  type: 'text',
  x: 0, y: 0,
  text: 'Hey, polotno',
  fontSize: 14,
  fontFamily: 'Roboto',
  fontStyle: 'normal',       // 'normal' | 'italic'
  fontWeight: 'normal',      // 'normal' | 'bold'
  fill: 'black',
  align: 'center',
  width: 300,
  lineHeight: 1,
  letterSpacing: 0,
});
```

### Image Element

```js
page.addElement({
  type: 'image',
  src: 'https://example.com/image.png',
  x: 0, y: 0,
  width: 100, height: 100,
  clipSrc: '',               // SVG/image URL for masking
  cropX: 0, cropY: 0,       // 0-1: % of original
  cropWidth: 1, cropHeight: 1,
  cornerRadius: 0,
});
```

### SVG Element

```js
page.addElement({
  type: 'svg',
  src: 'https://example.com/icon.svg',
  x: 0, y: 0, width: 100, height: 100,
  maskSrc: '',
  colorsReplace: {},
});
svgElement.replaceColor('#000000', '#ff0000');
```

### Figure, Line, Video

```js
page.addElement({ type: 'figure', x: 0, y: 0, width: 100, height: 100, fill: 'blue' });
page.addElement({ type: 'line', x: 0, y: 0, width: 200, height: 0, color: 'black' });
page.addElement({ type: 'video', src: 'https://example.com/video.mp4', x: 0, y: 0, width: 400, height: 300 });
```

### Group

```js
const group = store.groupElements([el1.id, el2.id]);
store.ungroupElements([group.id]);
```

### Element Actions

```js
element.set({ x: 100, fill: 'red' });
element.moveUp(); element.moveDown(); element.moveTop(); element.moveBottom();
```

### Custom Data (Important!)

```js
// ❌ element.set({ userId: '12' });     // won't work — arbitrary props ignored
// ✅ element.set({ custom: { userId: '12' } });
console.log(element.custom?.userId);
```

### Element Locking

```js
element.set({
  draggable: false,
  contentEditable: false,
  styleEditable: false,
  resizable: false,
  removable: false,
});
```

## UI Components

| Component | Import | Purpose |
|-----------|--------|---------|
| `PolotnoContainer` | `polotno` | Root layout container |
| `SidePanelWrap` | `polotno` | Side panel layout wrapper |
| `WorkspaceWrap` | `polotno` | Workspace layout wrapper |
| `Workspace` | `polotno/canvas/workspace` | Main canvas |
| `Toolbar` | `polotno/toolbar/toolbar` | Element toolbar |
| `ZoomButtons` | `polotno/toolbar/zoom-buttons` | Zoom controls |
| `SidePanel` | `polotno/side-panel` | Side panel with tabs |
| `PagesTimeline` | `polotno/pages-timeline` | Pages navigator |

## Custom Side Panel

```js
import { observer } from 'mobx-react-lite';
import { SidePanel, SectionTab, DEFAULT_SECTIONS } from 'polotno/side-panel';

const CustomSection = {
  name: 'custom',
  Tab: (props) => <SectionTab name="Custom" {...props}><MyIcon /></SectionTab>,
  Panel: observer(({ store }) => <div>Custom content</div>),
};

const sections = [CustomSection, ...DEFAULT_SECTIONS];
<SidePanel store={store} sections={sections} defaultSection="custom" />
```

## Common Gotchas

1. **Use `custom` for app-specific data** — Arbitrary element properties are silently ignored
2. **`isAlive` guard on MST computed views** — Check `isAlive(self)` before accessing parent nodes in computed properties
3. **Always `await store.waitLoading()`** before exporting
4. **Import Blueprint CSS** — `@blueprintjs/core/lib/css/blueprint.css`
5. **Wrap components in `observer()`** for MobX reactivity
6. **Use `svgElement.replaceColor()`** instead of modifying `colorsReplace` directly
7. **Text `placeholder`** values are removed from export results

## Import Paths Reference

```js
import { createStore } from 'polotno/model/store';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Workspace } from 'polotno/canvas/workspace';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel, SectionTab, DEFAULT_SECTIONS } from 'polotno/side-panel';
import { PagesTimeline } from 'polotno/pages-timeline';
import { ImagesGrid } from 'polotno/side-panel/images-grid';
import { useInfiniteAPI } from 'polotno/utils/use-api';
import { getImageSize, getCrop } from 'polotno/utils/image';
import { observer } from 'mobx-react-lite';
```

## Documentation

Full docs: https://polotno.com/docs
