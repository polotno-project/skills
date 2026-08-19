#!/usr/bin/env node
/**
 * Run deterministic checks on Polotno JSON. This script does not render or
 * change the design.
 *
 * Usage:
 *   node lint.js <design.json>
 */
const fs = require('fs');
const path = require('path');

const PLACEHOLDER_SOURCE = /\$\{(?:photo|icon):[^}]*\}/i;
const PLACEHOLDER_TEXT = /lorem ipsum|\boption\s+[a-z](?:\s*\/\s*option\s+[a-z])?/i;
const ASSET_TYPES = new Set(['image', 'svg', 'gif', 'video']);
const KNOWN_SOURCE = /^(?:https?:|data:|blob:|file:|workspace:|asset:|\/|\.\.?\/)/i;

function issue(list, rule, pageId, elementId, message) {
  list.push({ rule, pageId, ...(elementId ? { elementId } : {}), message });
}

function textLineCount(text, maxChars) {
  let lines = 0;
  for (const paragraph of String(text).split('\n')) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines += 1;
      continue;
    }
    let used = 0;
    let paragraphLines = 1;
    for (const word of words) {
      if (word.length > maxChars) {
        if (used > 0) paragraphLines += 1;
        paragraphLines += Math.ceil(word.length / maxChars) - 1;
        used = word.length % maxChars || maxChars;
        continue;
      }

      const next = used === 0 ? word.length : used + 1 + word.length;
      if (used > 0 && next > maxChars) {
        paragraphLines += 1;
        used = word.length;
      } else {
        used = next;
      }
    }
    lines += paragraphLines;
  }
  return lines;
}

function textFitWarning(element) {
  const { text, width, height, fontSize } = element;
  if (!text || ![width, height, fontSize].every((value) => Number.isFinite(value))) {
    return null;
  }
  if (width <= 0 || height <= 0 || fontSize <= 0) return null;

  const spacing = Number.isFinite(element.letterSpacing)
    ? Math.max(0, element.letterSpacing) * fontSize
    : 0;
  const averageGlyphWidth = fontSize * 0.56 + spacing;
  const maxChars = Math.max(1, Math.floor(width / averageGlyphWidth));
  const lines = textLineCount(text, maxChars);
  const lineHeight = Number.isFinite(element.lineHeight) ? element.lineHeight : 1.2;
  const requiredHeight = lines * fontSize * lineHeight;
  if (requiredHeight <= height * 1.05) return null;

  return `estimated text height ${Math.ceil(requiredHeight)} exceeds box height ${height}`;
}

function hasBox(element) {
  return ['x', 'y', 'width', 'height'].every((key) => Number.isFinite(element[key]));
}

function solidOpaqueRect(element) {
  if (element.type !== 'figure') return false;
  if (element.subType && element.subType !== 'rect') return false;
  if ((element.opacity ?? 1) < 0.98 || element.rotation) return false;
  const fill = String(element.fill || '').replace(/\s+/g, '').toLowerCase();
  if (fill === 'transparent') return false;
  const rgba = /^rgba\([^,]+,[^,]+,[^,]+,([^)]+)\)$/.exec(fill);
  return !rgba || Number(rgba[1]) >= 0.98;
}

function contains(outer, inner) {
  if (!hasBox(outer) || !hasBox(inner)) return false;
  return (
    outer.x <= inner.x &&
    outer.y <= inner.y &&
    outer.x + outer.width >= inner.x + inner.width &&
    outer.y + outer.height >= inner.y + inner.height
  );
}

function lintDesign(design, fontNames) {
  const errors = [];
  const warnings = [];
  const knownFonts = new Set(fontNames.map((font) => font.toLowerCase()));
  const fontDeclarations = Array.isArray(design.fonts) ? design.fonts : [];
  const designFonts = new Set(
    fontDeclarations
      .map((font) => font.fontFamily || font.name)
      .filter(Boolean)
      .map((font) => font.toLowerCase())
  );
  const seenIds = new Map();
  const width = design.width || 1080;
  const height = design.height || 1080;
  const pages = Array.isArray(design.pages) ? design.pages : [];

  if (!Array.isArray(design.pages)) {
    issue(errors, 'json-shape', null, null, 'design pages must be an array');
  }
  if (design.fonts !== undefined && !Array.isArray(design.fonts)) {
    issue(errors, 'json-shape', null, null, 'design fonts must be an array');
  }

  function recordId(id, pageId, kind) {
    if (!id) return;
    if (seenIds.has(id)) {
      issue(
        errors,
        'duplicate-id',
        pageId,
        kind === 'element' ? id : null,
        `id "${id}" is also used on page "${seenIds.get(id)}"`
      );
    } else {
      seenIds.set(id, pageId);
    }
  }

  function inspectElement(element, pageId) {
    recordId(element.id, pageId, 'element');

    if (typeof element.src === 'string' && PLACEHOLDER_SOURCE.test(element.src)) {
      issue(
        errors,
        'placeholder-residue',
        pageId,
        element.id,
        `unresolved source placeholder: ${element.src}`
      );
    }

    if (element.type === 'text') {
      if (PLACEHOLDER_TEXT.test(element.text || '')) {
        issue(errors, 'placeholder-residue', pageId, element.id, 'placeholder text remains');
      }

      const letterSpacing = element.letterSpacing;
      if (Number.isFinite(letterSpacing) && Math.abs(letterSpacing) > 2) {
        issue(
          errors,
          'letter-spacing',
          pageId,
          element.id,
          `letterSpacing ${letterSpacing} uses an unexpected scale`
        );
      }

      const family = element.fontFamily;
      if (
        family &&
        !knownFonts.has(family.toLowerCase()) &&
        !designFonts.has(family.toLowerCase())
      ) {
        issue(
          warnings,
          'font-unknown',
          pageId,
          element.id,
          `fontFamily "${family}" is not a known Google font or a declared design font`
        );
      }

      const minimumSize = height / 90;
      if (Number.isFinite(element.fontSize) && element.fontSize < minimumSize) {
        issue(
          warnings,
          'tiny-text',
          pageId,
          element.id,
          `fontSize ${element.fontSize} is less than ${Math.round(minimumSize)}`
        );
      }

      const fitMessage = textFitWarning(element);
      if (fitMessage) {
        issue(warnings, 'text-fit', pageId, element.id, fitMessage);
      }
    }

    if (ASSET_TYPES.has(element.type)) {
      if (typeof element.src !== 'string' || element.src.trim() === '') {
        issue(errors, 'asset-source', pageId, element.id, 'asset source is empty');
      } else if (!PLACEHOLDER_SOURCE.test(element.src) && !KNOWN_SOURCE.test(element.src)) {
        issue(
          warnings,
          'asset-source',
          pageId,
          element.id,
          `asset source has an unrecognized form: ${element.src}`
        );
      }

      for (const key of ['cropX', 'cropY', 'cropWidth', 'cropHeight']) {
        const value = element[key];
        if (value !== undefined && (!Number.isFinite(value) || value < 0 || value > 1)) {
          issue(errors, 'crop-range', pageId, element.id, `${key} must be from 0 through 1`);
        }
      }
    }

    if (hasBox(element)) {
      if (element.width <= 0 || element.height <= 0) {
        issue(errors, 'element-size', pageId, element.id, 'element width and height must be positive');
      }

      if (!element.rotation) {
        const fullyOutside =
          element.x >= width ||
          element.y >= height ||
          element.x + element.width <= 0 ||
          element.y + element.height <= 0;
        const partlyOutside =
          element.x < 0 ||
          element.y < 0 ||
          element.x + element.width > width ||
          element.y + element.height > height;

        if (fullyOutside) {
          issue(errors, 'out-of-bounds', pageId, element.id, 'element is outside the canvas');
        } else if (partlyOutside) {
          issue(
            warnings,
            'out-of-bounds',
            pageId,
            element.id,
            'element crosses the canvas edge. Make sure that this is intentional'
          );
        }
      }
    }
  }

  function inspectSiblings(children, pageId) {
    const list = Array.isArray(children) ? children : [];
    list.forEach((element, index) => {
      inspectElement(element, pageId);

      const covered = list
        .slice(index + 1)
        .some((above) => solidOpaqueRect(above) && contains(above, element));
      if (covered) {
        issue(
          warnings,
          'covered-element',
          pageId,
          element.id,
          'a later opaque rectangle covers this element'
        );
      }

      if (element.type === 'group') inspectSiblings(element.children, pageId);
    });
  }

  for (const [index, page] of pages.entries()) {
    const pageId = page.id || `page-${index + 1}`;
    recordId(page.id, pageId, 'page');
    if (!Array.isArray(page.children) || page.children.length === 0) {
      issue(warnings, 'empty-page', pageId, null, 'page has no elements');
      continue;
    }
    inspectSiblings(page.children, pageId);
  }

  if ((design.dpi || 72) >= 150) {
    const noBleed = pages.every((page) => !page.bleed);
    if (noBleed) {
      issue(
        warnings,
        'print-bleed',
        null,
        null,
        `dpi ${design.dpi} suggests print, but no page sets bleed`
      );
    }
  }

  return { errors, warnings };
}

function main() {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: node lint.js <design.json>');
    process.exit(2);
  }

  let design;
  try {
    design = JSON.parse(fs.readFileSync(input, 'utf8'));
  } catch (error) {
    console.log(
      JSON.stringify(
        {
          errors: [{ rule: 'json-parse', pageId: null, message: error.message }],
          warnings: []
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  if (!design || typeof design !== 'object' || Array.isArray(design)) {
    console.log(
      JSON.stringify(
        {
          errors: [
            { rule: 'json-shape', pageId: null, message: 'design JSON must be an object' }
          ],
          warnings: []
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  const fontNames = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'google-fonts.json'), 'utf8')
  );
  const report = lintDesign(design, fontNames);
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.errors.length ? 1 : 0);
}

if (require.main === module) main();

module.exports = { lintDesign, textFitWarning };
