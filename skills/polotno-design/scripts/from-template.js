#!/usr/bin/env node
/**
 * Build a new design from a template's layout pages.
 *
 * Usage:
 *   node from-template.js <template.json> --list
 *   node from-template.js <template.json> <plan.json> <out.json>
 *
 * A layout is a template page, named by custom.layout or else by its id. A slot
 * is an element with custom.slot. --list prints each layout and its slots, so
 * you do not need to read the template itself.
 *
 * plan.json:
 *   { "pages": [
 *     { "layout": "title", "slots": { "title": "Q3 review", "photo": "https://…" } },
 *     { "layout": "table", "slots": { "data": [["Name", "Share"], ["A", "22%"]] },
 *       "add": [ …extra elements… ], "background": "#ffffff" }
 *   ] }
 *
 * Slot values:
 *   string       text of a text element, or src of an image, svg, gif, or video
 *   object       properties to set on the element
 *   rows array   table cells, header row first. New rows copy the template's
 *                body rows in turn, so stripes continue. Columns cannot change.
 *   null         removes the element
 *
 * A plan must give a value for every slot on a page. Other page keys, such as
 * background and duration, set page properties. Each page gets new element ids.
 * The template's size, fonts, and custom.brand carry over. A template in an
 * older format is migrated first.
 */
const fs = require('fs');

const { ensureDependencies } = require('./dependencies');
const { forEachNode } = require('./lint');

const ASSET_TYPES = new Set(['image', 'svg', 'gif', 'video']);

function layoutName(page) {
  return page.custom?.layout ?? page.id;
}

function textCapacity(node) {
  const fontSize = (node.textOverflow === 'fit' && node.minFontSize) || node.fontSize;
  if (!fontSize) return undefined;
  const lineHeight = Number.isFinite(node.lineHeight) ? node.lineHeight : 1.2;
  const perLine = Math.floor(node.width / (fontSize * 0.56));
  const lines = Math.max(1, Math.floor(node.height / (fontSize * lineHeight)));
  return perLine * lines;
}

function describeLayouts(template) {
  return template.pages.map((page) => {
    const slots = [];
    forEachNode(page.children, (node) => {
      if (!node.custom?.slot) return;
      const slot = { slot: node.custom.slot, type: node.type };
      if (node.type === 'text') slot.maxChars = textCapacity(node);
      if (node.type === 'table') Object.assign(slot, { rows: node.rows, cols: node.cols });
      if (ASSET_TYPES.has(node.type)) Object.assign(slot, { width: node.width, height: node.height });
      slots.push(slot);
    });
    return { layout: layoutName(page), slots };
  });
}

function fillTable(table, rows, where, errors) {
  if (rows.some((row) => !Array.isArray(row) || row.length !== table.cols)) {
    errors.push(`${where}: every row needs ${table.cols} cells`);
    return;
  }
  const sameShape = rows.length === table.rows;
  if (!sameShape && table.cells.some((cell) => cell.mergedInto)) {
    errors.push(`${where}: a table with merged cells keeps its ${table.rows} rows`);
    return;
  }
  const bodyRows = Math.max(1, table.rows - 1);
  const sourceRow = (row) => (row < table.rows ? row : 1 + ((row - 1) % bodyRows));
  const renamed = new Map();
  table.cells = rows.flatMap((values, row) =>
    values.map((value, col) => {
      const source = table.cells[Math.min(sourceRow(row), table.rows - 1) * table.cols + col];
      const id = `r${row}c${col}`;
      if (row < table.rows) renamed.set(source.id, id);
      return { ...source, id, text: String(value ?? '') };
    })
  );
  for (const cell of table.cells) {
    if (cell.mergedInto) cell.mergedInto = renamed.get(cell.mergedInto);
  }
  if (!sameShape) {
    table.rows = rows.length;
    table.rowHeights = rows.map(() => 1 / rows.length);
  }
}

function fillElement(node, value, where, errors) {
  if (node.type === 'table' && Array.isArray(value)) {
    fillTable(node, value, where, errors);
  } else if (Array.isArray(value)) {
    errors.push(`${where}: a ${node.type} takes a string or an object. For lines of text, use "\\n"`);
  } else if (value && typeof value === 'object') {
    Object.assign(node, value);
  } else if (ASSET_TYPES.has(node.type)) {
    node.src = String(value);
  } else if (node.type === 'text') {
    node.text = String(value);
  } else {
    errors.push(`${where}: a ${node.type} needs an object of properties`);
  }
}

function fillChildren(children, slots, used, where, errors) {
  const kept = [];
  for (const node of children) {
    const slot = node.custom?.slot;
    if (slot && !(slot in slots)) {
      errors.push(`${where}: slot "${slot}" has no value. Use null to remove the element`);
    } else if (slot) {
      used.add(slot);
      if (slots[slot] === null) continue;
      fillElement(node, slots[slot], `${where} slot "${slot}"`, errors);
    }
    if (Array.isArray(node.children)) {
      node.children = fillChildren(node.children, slots, used, where, errors);
    }
    kept.push(node);
  }
  return kept;
}

function withPageIds(children, prefix) {
  forEachNode(children, (node) => {
    node.id = `${prefix}-${node.id}`;
    if (node.mergedInto) node.mergedInto = `${prefix}-${node.mergedInto}`;
  });
  return children;
}

function buildPage(layouts, entry, index, errors) {
  const { layout, slots = {}, add = [], ...pageProperties } = entry;
  const where = `page ${index + 1} (${layout})`;
  const source = layouts.get(layout);
  if (!source) {
    errors.push(`${where}: no such layout. Available: ${[...layouts.keys()].join(', ')}`);
    return null;
  }

  const page = structuredClone(source);
  const used = new Set();
  const id = pageProperties.id ?? `p${index + 1}`;
  page.children = fillChildren(page.children ?? [], slots, used, where, errors);
  for (const slot of Object.keys(slots)) {
    if (!used.has(slot)) errors.push(`${where}: this layout has no slot "${slot}"`);
  }
  // A table row can repeat a source cell id, so rename cells inside each table.
  forEachNode(page.children, (node) => {
    for (const cell of node.cells ?? []) {
      cell.id = `${node.id}-${cell.id}`;
      if (cell.mergedInto) cell.mergedInto = `${node.id}-${cell.mergedInto}`;
    }
  });
  page.children = withPageIds([...page.children, ...structuredClone(add)], id);
  return { ...page, ...pageProperties, id };
}

function buildDesign(template, plan) {
  const errors = [];
  if (!Array.isArray(plan.pages) || plan.pages.length === 0) {
    return { errors: ['the plan needs a pages array'] };
  }
  const layouts = new Map(template.pages.map((page) => [layoutName(page), page]));
  const pages = plan.pages.map((entry, index) => buildPage(layouts, entry, index, errors));
  return { errors, design: { ...template, pages } };
}

function fail(errors) {
  console.log(JSON.stringify({ valid: false, errors }, null, 2));
  process.exit(1);
}

async function main() {
  const [templateFile, planFile, output] = process.argv.slice(2);
  const list = planFile === '--list';
  if (!templateFile || !planFile || (!list && !output)) {
    console.error(
      'Usage: node from-template.js <template.json> --list\n' +
        '       node from-template.js <template.json> <plan.json> <out.json>'
    );
    process.exit(2);
  }

  ensureDependencies();
  const { migrateDesign } = await import('@polotno/schema');
  const source = JSON.parse(fs.readFileSync(templateFile, 'utf8'));
  const template = migrateDesign(source);

  if (list) {
    const { width, height, fonts, custom } = template;
    console.log(
      JSON.stringify(
        { width, height, fonts: fonts?.map((font) => font.fontFamily), brand: custom?.brand, layouts: describeLayouts(template) },
        null,
        2
      )
    );
    return;
  }

  const plan = JSON.parse(fs.readFileSync(planFile, 'utf8'));
  const { errors, design } = buildDesign(template, plan);
  if (errors.length) fail(errors);

  fs.writeFileSync(output, `${JSON.stringify(design, null, 2)}\n`);
  console.log(
    JSON.stringify(
      {
        valid: true,
        output,
        pages: design.pages.length,
        ...(source.schemaVersion === template.schemaVersion
          ? {}
          : { migratedFrom: source.schemaVersion ?? 'no version' })
      },
      null,
      2
    )
  );
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(2);
  });
}

module.exports = { buildDesign, describeLayouts };
