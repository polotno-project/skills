## Store API

### Creating & Configuration
```js
import { createStore } from 'polotno/model/store';
const store = createStore({ key: 'YOUR_API_KEY', showCredit: true });
```

### Pages
```js
const page = store.addPage();                        // add empty page
store.addPage({ background: 'grey' });               // with background
store.pages;                                          // all pages
store.activePage;                                     // current active page
store.selectPage(store.pages[1].id);                 // focus a page
store.deletePages([store.activePage.id]);             // remove pages
store.clear();                                        // remove all data
```

### Canvas Size
```js
store.setSize(1080, 1080);                // set page size
store.setSize(1080, 1080, true);          // with magic resize
store.setUnit({ unit: 'mm', dpi: 300 }); // unit metrics for UI
```

### Selection
```js
store.selectedElements;                   // selected elements array
store.selectElements([el.id]);            // select by id
store.selectElements([]);                 // clear selection
store.getElementById('id');               // find element
```

### Grouping
```js
store.groupElements([el1.id, el2.id]);
store.ungroupElements([group.id]);
```

### Undo/Redo
```js
store.history.undo();
store.history.redo();
```

### Import/Export JSON
```js
const json = store.toJSON();
store.loadJSON(json);
await store.waitLoading();
```

### Export Images
```js
const url = await store.toDataURL();
const url = await store.toDataURL({ pixelRatio: 2, mimeType: 'image/jpeg' });
const url = await store.toDataURL({ pageId: store.pages[1].id });
await store.saveAsImage({ fileName: 'design.png' });
const blob = await store.toBlob({ pixelRatio: 2 });
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
store.openSidePanel('templates');
store.setScale(2);
store.toggleBleed();
store.toggleRulers();
store.setRole('admin');
```

## Page API

```js
const page = store.addPage({ background: 'grey' });
page.set({ background: 'red', custom: { myId: 'id' }, bleed: 10 });
page.setSize({ width: 1000, height: 1000, useMagic: true });
page.clone();
page.setZIndex(0);
page.children;             // elements array
page.computedWidth;
page.computedHeight;
```

## Element Types

All elements: `x`, `y`, `rotation`, `width`, `height`, `opacity`, `name`, `visible`, `selectable`, `draggable`, `contentEditable`, `styleEditable`, `resizable`, `removable`, `custom`.

### Text
```js
page.addElement({
  type: 'text', x: 0, y: 0,
  text: 'Hello', fontSize: 14, fontFamily: 'Roboto',
  fontStyle: 'normal', fontWeight: 'normal',
  fill: 'black', align: 'center', width: 300,
  lineHeight: 1, letterSpacing: 0,
});
```

### Image
```js
page.addElement({
  type: 'image', src: 'https://example.com/img.png',
  x: 0, y: 0, width: 100, height: 100,
  clipSrc: '', cropX: 0, cropY: 0, cropWidth: 1, cropHeight: 1,
  cornerRadius: 0, borderColor: 'black', borderSize: 0,
});
```

### SVG
```js
page.addElement({
  type: 'svg', src: 'https://example.com/icon.svg',
  x: 0, y: 0, width: 100, height: 100,
  maskSrc: '', colorsReplace: {},
});
svgEl.replaceColor('#000', '#f00');
```

### Figure
```js
page.addElement({ type: 'figure', x: 0, y: 0, width: 100, height: 100, fill: 'blue' });
```

### Line
```js
page.addElement({ type: 'line', x: 0, y: 0, width: 200, height: 0, color: 'black' });
```

### Video
```js
page.addElement({ type: 'video', src: 'https://example.com/v.mp4', x: 0, y: 0, width: 400, height: 300 });
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

### Custom Data
```js
// ❌ element.set({ userId: '12' });     // won't work
// ✅ element.set({ custom: { userId: '12' } });
```

### Locking
```js
element.set({ draggable: false, contentEditable: false, styleEditable: false, resizable: false, removable: false });
```

## UI Components

```jsx
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { PagesTimeline } from 'polotno/pages-timeline';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel, SectionTab, DEFAULT_SECTIONS } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { ImagesGrid } from 'polotno/side-panel/images-grid';
import { useInfiniteAPI } from 'polotno/utils/use-api';
import { getImageSize, getCrop } from 'polotno/utils/image';
```

## Custom Side Panel

```js
const CustomSection = {
  name: 'custom',
  Tab: (props) => <SectionTab name="Custom" {...props}><MyIcon /></SectionTab>,
  Panel: observer(({ store }) => <div>Custom content</div>),
};
const sections = [CustomSection, ...DEFAULT_SECTIONS];
<SidePanel store={store} sections={sections} />
```

## Common Gotchas

1. Use `custom` attribute for app-specific data — arbitrary element props are ignored
2. Always `await store.waitLoading()` before export
3. Import `@blueprintjs/core/lib/css/blueprint.css`
4. Wrap components in `observer()` for reactivity
5. Check `isAlive(self)` in MST computed views accessing parent nodes
6. Use `svgElement.replaceColor()` instead of modifying `colorsReplace` directly
7. Text `placeholder` values are removed from export
