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
store.width;                                // current width
store.height;                               // current height
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
store.history.canUndo;
store.history.canRedo;
```

### Import/Export JSON

```js
const json = store.toJSON();                // serialize entire store
store.loadJSON(json);                       // load from JSON
await store.waitLoading();                  // wait for all assets to load
```

### Export Images

```js
// Export as data URL
const url = await store.toDataURL();
const url = await store.toDataURL({ pixelRatio: 2 });                    // higher quality
const url = await store.toDataURL({ mimeType: 'image/jpeg' });           // JPEG
const url = await store.toDataURL({ pageId: store.pages[1].id });        // specific page

// Save as file download
await store.saveAsImage({ fileName: 'design.png' });
await store.saveAsImage({ pixelRatio: 2, mimeType: 'image/jpeg' });

// Export as blob (faster than toDataURL)
const blob = await store.toBlob();
const blob = await store.toBlob({ pixelRatio: 2 });
```

### Export PDF

```js
const pdfUrl = await store.toPDFDataURL();
const pdfUrl = await store.toPDFDataURL({ pixelRatio: 2 });
const pdfUrl = await store.toPDFDataURL({
  includeBleed: true,
  cropMarkSize: 20,
  unit: 'mm',
});

await store.saveAsPDF({ fileName: 'design.pdf', dpi: 300 });
```

### Export SVG/HTML/GIF

```js
const svg = await store.toSVG();
await store.saveAsSVG();
const html = await store.toHTML();
await store.saveAsHTML();
const gif = await store.toGIFDataURL({ fps: 10 });
await store.saveAsGIF({ fileName: 'anim.gif' });
```

### High-Quality Export

```js
// Increase element rendering resolution before export
store.setElementsPixelRatio(2);
const url = await store.toDataURL({ pixelRatio: 2 });
```

### UI Control

```js
store.openSidePanel('templates');           // open side panel by name
store.openedSidePanel;                      // current open panel
store.setScale(2);                          // zoom level
store.scale;                                // current zoom
store.toggleBleed();                        // show/hide bleed area
store.toggleRulers();                       // show/hide rulers
store.setRole('admin');                     // set user role
```

### Animations & Video

```js
store.play();                               // play animations
store.play({ startTime: 1000, endTime: 5000, repeat: true });
store.stop();                               // stop animations
store.setCurrentTime(2000);                 // seek
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
page.computedWidth;                         // actual width in pixels
page.computedHeight;                        // actual height in pixels
```

### Adding Elements to Page

```js
const element = page.addElement({
  type: 'text',
  x: 50, y: 50,
  fill: 'black',
  text: 'Hello!',
});
```

## Element Types & Properties

All elements share common properties: `x`, `y`, `rotation`, `width`, `height`, `opacity`, `name`, `visible`, `selectable`, `draggable`, `contentEditable`, `styleEditable`, `resizable`, `removable`, `alwaysOnTop`, `showInExport`, `custom`.

### Text Element

```js
page.addElement({
  type: 'text',
  x: 0, y: 0,
  text: 'Hey, polotno',
  placeholder: '',           // shown when text is empty, removed from export
  fontSize: 14,
  fontFamily: 'Roboto',
  fontStyle: 'normal',       // 'normal' | 'italic'
  fontWeight: 'normal',      // 'normal' | 'bold'
  textDecoration: '',
  fill: 'black',
  align: 'center',
  width: 300,
  lineHeight: 1,
  letterSpacing: 0,          // % of font size
  strokeWidth: 0,
  stroke: 'black',
  backgroundEnabled: false,
  backgroundColor: '#7ED321',
  backgroundOpacity: 1,
  backgroundCornerRadius: 0.5,
  backgroundPadding: 0.5,
});

// Enter text editing mode
textElement.toggleEditMode();
```

### Image Element

```js
page.addElement({
  type: 'image',
  src: 'https://example.com/image.png',
  x: 0, y: 0,
  width: 100, height: 100,
  keepRatio: false,
  clipSrc: '',               // SVG/image URL for masking/framing
  cropX: 0, cropY: 0,       // 0-1: % of original image
  cropWidth: 1, cropHeight: 1,
  cornerRadius: 0,
  borderColor: 'black',
  borderSize: 0,
  flipX: false, flipY: false,
});

// Enter crop mode
imageElement.toggleCropMode(true);
```

### SVG Element

```js
page.addElement({
  type: 'svg',
  src: 'https://example.com/image.svg',
  x: 0, y: 0,
  width: 100, height: 100,
  keepRatio: false,
  maskSrc: '',               // draw mask image over svg
  colorsReplace: {},         // use el.replaceColor(original, newColor)
  flipX: false, flipY: false,
  cornerRadius: 0,
});

// Replace colors in SVG
svgElement.replaceColor('#000000', '#ff0000');
```

### Figure Element

```js
page.addElement({
  type: 'figure',
  x: 0, y: 0,
  width: 100, height: 100,
  fill: 'blue',
  // figures use a subType like 'rect', 'circle', 'triangle', 'star', etc.
});
```

### Line Element

```js
page.addElement({
  type: 'line',
  x: 0, y: 0,
  width: 200, height: 0,
  color: 'black',
  dash: [],                  // dash pattern
  startHead: '',             // arrow head type
  endHead: '',
});
```

### Video Element

```js
page.addElement({
  type: 'video',
  src: 'https://example.com/video.mp4',
  x: 0, y: 0,
  width: 400, height: 300,
});
```

### Group Element

```js
// Create group from existing elements
const group = store.groupElements([el1.id, el2.id]);

// Add elements to group
group.addElement({ type: 'text', text: 'inside group' });

// Ungroup
store.ungroupElements([group.id]);
```

### Element Actions

```js
element.set({ x: 100, fill: 'red' });      // update properties
element.moveUp();                           // z-index up
element.moveDown();                         // z-index down
element.moveTop();                          // z-index to top
element.moveBottom();                       // z-index to bottom
```

### Custom Data

```js
// WRONG: arbitrary properties are not allowed
element.set({ userId: '12' });              // ❌ won't work

// RIGHT: use the 'custom' attribute
element.set({ custom: { userId: '12' } });  // ✅
console.log(element.custom?.userId);
```

### Element Locking

```js
element.set({
  draggable: false,          // prevent move/rotate
  contentEditable: false,    // prevent content changes
  styleEditable: false,      // prevent style changes
  resizable: false,          // prevent resize
  removable: false,          // prevent deletion
});
console.log(element.locked); // true (computed from above)
```

## UI Components

| Component | Import | Purpose |
|-----------|--------|---------|
| `PolotnoContainer` | `polotno` | Root layout container |
| `SidePanelWrap` | `polotno` | Side panel layout wrapper |
| `WorkspaceWrap` | `polotno` | Workspace layout wrapper |
| `Workspace` | `polotno/canvas/workspace` | Main canvas rendering |
| `Toolbar` | `polotno/toolbar/toolbar` | Element manipulation toolbar |
| `ZoomButtons` | `polotno/toolbar/zoom-buttons` | Zoom controls |
| `SidePanel` | `polotno/side-panel` | Side panel with tabs |
| `PagesTimeline` | `polotno/pages-timeline` | Pages timeline/navigator |

## Customization Patterns

### Custom Side Panel Section

```js
import { observer } from 'mobx-react-lite';
import { SidePanel, SectionTab, DEFAULT_SECTIONS } from 'polotno/side-panel';
import FaShapes from '@meronex/icons/fa/FaShapes';

const CustomSection = {
  name: 'custom',
  Tab: (props) => (
    <SectionTab name="Custom" {...props}>
      <FaShapes />
    </SectionTab>
  ),
  Panel: observer(({ store }) => (
    <div>
      <p>Elements: {store.activePage?.children.length}</p>
    </div>
  )),
};

const sections = [CustomSection, ...DEFAULT_SECTIONS];
<SidePanel store={store} sections={sections} defaultSection="custom" />
```

### Custom Images Panel

```js
import { ImagesGrid } from 'polotno/side-panel/images-grid';
import { getImageSize } from 'polotno/utils/image';

<ImagesGrid
  images={images}
  getPreview={(image) => image.url}
  onSelect={async (image, pos, element) => {
    const { width, height } = await getImageSize(image.url);
    store.activePage?.addElement({
      type: 'image',
      src: image.url,
      width, height,
      x: pos?.x || 0,
      y: pos?.y || 0,
    });
  }}
  rowsNumber={2}
  isLoading={loading}
/>
```

### Infinite Scrolling API Hook

```js
import { useInfiniteAPI } from 'polotno/utils/use-api';

const { data, isLoading, setQuery, loadMore } = useInfiniteAPI({
  defaultQuery: '',
  getAPI: ({ page, query }) => `https://api.example.com/images?q=${query}&page=${page}`,
  getSize: (res) => res.totalResults / res.perPage,
});
```

### Custom Toolbar Components

```jsx
<Toolbar
  store={store}
  components={{
    TextApplyToAllPages: MyCustomButton,
    ImageApplyToAllPages: MyCustomButton,
  }}
/>
```

### Custom Fonts

```js
import { addGlobalFont } from 'polotno/utils/fonts';

addGlobalFont({
  fontFamily: 'MyCustomFont',
  url: 'https://example.com/my-font.woff2',
});
```

## Reactivity (MobX)

Polotno is built on MobX. Use `observer()` to make React components reactive:

```js
import { observer } from 'mobx-react-lite';

const MyComponent = observer(({ store }) => {
  return <div>Scale: {store.scale}</div>;
});
```

## Common Gotchas

1. **Use `custom` for app-specific data** — You cannot set arbitrary properties on elements. Always use `element.set({ custom: { ... } })`.

2. **`isAlive` guard on MST computed properties** — Any MST computed view that accesses a parent node (via `getParent`, `getParentOfType`) must check `isAlive(self)` first and return safe defaults if dead. When a page is deleted, MST destroys nodes synchronously but React unmounts asynchronously.

3. **Always await `store.waitLoading()`** before exporting — Images and fonts may still be loading when you call export methods.

4. **Don't manipulate DOM directly** — Never use `innerHTML` to remove the editor container while exports are in progress. Use React state to unmount components properly.

5. **Blueprint.js CSS required** — Always import `@blueprintjs/core/lib/css/blueprint.css` for proper UI rendering.

6. **Elements are MobX observables** — Read properties directly (e.g., `element.x`), update with `element.set({ x: 100 })`.

7. **`placeholder` on text elements** — Placeholders are removed from export results. Use them for template designs where users replace text.

8. **SVG color replacement** — Use `svgElement.replaceColor(original, newColor)` instead of modifying `colorsReplace` directly.

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
import { createDemoApp } from 'polotno/polotno-app';
import { observer } from 'mobx-react-lite';
```

## Documentation

Full docs: https://polotno.com/docs
