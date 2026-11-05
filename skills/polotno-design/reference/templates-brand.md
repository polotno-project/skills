# Templates, brand rules, and custom fonts

## Build from a template

A template is a Polotno design whose pages are layouts. Its elements hold the
customer's look. A new design reuses those pages with new content.

1. **List it.** `node scripts/from-template.js template.json --list` prints each
   layout and slot, with the text capacity of each slot. Use this output, and
   keep the full template JSON out of your context.
2. **Prepare it, once.** If the list shows no slots, add these to the template:
   `custom: { "layout": "<name>" }` on each page, and
   `custom: { "slot": "<name>" }` on each variable element. Add
   `textOverflow: "fit"` and `minFontSize` to variable text. Add
   `custom.repeat` to logos and footers. Save this as the template.
3. **Plan it.** Map the storyline to layouts in `plan.json`:

   ```json
   { "pages": [
     { "layout": "cover", "slots": { "title": "Spend control", "subtitle": "CFO review" } },
     { "layout": "table", "slots": { "title": "Top suppliers",
       "data": [["Supplier", "Share"], ["Supplier A", "22%"]] } },
     { "layout": "text", "slots": { "title": "Next steps", "body": "Approve the plan.", "note": null },
       "add": [ { "id": "bar", "type": "figure", "subType": "rect", "x": 96, "y": 900,
                  "width": 400, "height": 8, "fill": "#13A89E" } ] }
   ] }
   ```

4. **Build it.** `node scripts/from-template.js template.json plan.json deck.json`.
   Use a layout as often as you need. Each page gets new element ids.
5. **Check it.** Run `validate`, `lint` with `--brand`, and `render`. Proof every
   page.

| Slot value | Effect |
|---|---|
| String | Text of a text element, or `src` of an image, svg, gif, or video |
| Object | Properties to set on the element, such as `{ "src": "…", "cropX": 0.1 }` |
| Rows array | Table cells, header row first. Extra rows repeat the body rows, so stripes continue. The column count stays |
| `null` | Removes the element |

The plan must give every slot a value, so no template text can remain by
accident. `add` puts extra elements on a page, such as a chart. The template's
size, fonts, and `custom.brand` carry over. An older template format is migrated
first, and the report says so.

A customer template in PDF or PSD comes through `import.md` first.

## Check brand rules

Store the rules in the template, so they travel with each design:

```json
{ "custom": { "brand": { "colors": ["#0B2545", "#13A89E", "#FFFFFF"], "fonts": ["Inter"] } } }
```

`lint` then reports `brand-color` and `brand-font` errors for every element,
table cell, gradient stop, and page background. Without `custom.brand`, use
`--brand`:

- `lint.js deck.json --brand brand.json` reads the same two lists from a file.
- `lint.js deck.json --brand template.json` allows the colors and fonts that the
  template uses. Use this if the customer gave only a template.

Lint checks colors and fonts only. The visual proof checks logo use and tone.

## Use a custom font

`fonts` declares every font that is not a Google font:

```json
"fonts": [ { "fontFamily": "Acme Sans", "url": "https://cdn.example.com/acme-sans.woff2" } ]
```

For several weights, use `styles`:

```json
"fonts": [ { "fontFamily": "Acme Sans", "styles": [
  { "src": "url(https://cdn.example.com/acme-regular.woff2)", "fontWeight": "normal" },
  { "src": "url(https://cdn.example.com/acme-bold.woff2)", "fontWeight": "bold" }
] } ]
```

| Source | Use |
|---|---|
| `https:` URL with open CORS | Designs that others will open. Use this for delivery |
| `data:` URL | A self-contained file. It makes the JSON large |
| `file:` URL | This machine only, for the scripts. Replace it before you deliver the JSON |

An undeclared font stops the render with `FONT_FAILED`. Add a style for each
weight that the design uses.

PowerPoint files do not embed fonts: see `pptx.md`. If a customer font is not
licensed for embedding, use the raster PDF path.
