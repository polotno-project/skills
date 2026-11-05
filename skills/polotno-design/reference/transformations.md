# Transformation contracts

A transformation starts from an existing design. Before editing, declare what
can change and what must remain stable.

## Contracts

| Operation | Allowed changes | Protected properties |
| --- | --- | --- |
| Content update | Requested strings and assigned assets | Canvas, visual tokens, unrelated elements, reading order |
| Resize | Canvas, geometry, text fit, crop | Copy, content order, visual tokens, asset identity |
| Localization | Translated strings, script fonts, required text fit, language direction | Meaning, brand assets, visual roles, layout intent |
| Brand application | Colors, fonts, logos, and named brand treatments | Copy, message hierarchy, content assets, output purpose |
| Bulk variant | Declared slot values and dependent text fit or crop | Page structure, non-slot elements, visual tokens, slot names |

Add user-requested exceptions to the contract before editing. Do not expand the
allowed set because a repair is difficult.

## Procedure

1. Save the source JSON and make a source proof.
2. Select the applicable contract.
3. Record any explicit exception from the user.
4. Derive every result from the source, not from another result.
5. Preserve stable element identifiers and slot names where possible.
6. Run schema validation and preflight on every result.
7. View the source and result at the same display scale.
8. Compare each protected property and record deliberate deviations.

## Operation notes

### Content update

Change only the named content. If new text does not fit, adjust its own box or
type size before you move unrelated elements.

### Resize

Recompose for the new aspect ratio. Do not stretch the full design. Preserve
image subjects during crop changes. Keep the original message order.

### Localization

Preserve meaning and brand terms. Use a font with the required glyphs. Adapt
text fit and reading direction without copying raw geometry blindly. Read the
translated text section of `data-content.md`.

### Brand application

Map each visual role to a supplied brand value. Do not invent a logo, font,
color, or brand rule. Preserve the content hierarchy unless the brand guide
requires a documented change.

### Bulk variant

Start from a design that passed the completion contract.

1. Add `custom: { slot: "<name>" }` to each variable element.
2. Map every input field to a slot or exclude it explicitly.
3. Derive each variant from the same source. `scripts/from-template.js` does
   this: see `templates-brand.md`.
4. Run schema validation and preflight on every variant.
5. View the first row, the longest-text row, and the row with most asset changes.
6. Report failures by a stable row key.

Variable text needs `textOverflow: "fit"`: see `data-content.md`.

### An old source file

A source below the current `schemaVersion` needs `validate.js <file> --normalize
<out.json>` before you edit it. Keep the result. Changing only the number leaves
old values in place.
