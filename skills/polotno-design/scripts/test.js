#!/usr/bin/env node
const assert = require('assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { CHECK_INTERVAL_MS, needsUpdate } = require('./dependencies');
const { textFitWarning } = require('./lint');

process.env.POLOTNO_DEPENDENCY_UPDATE = 'never';

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'polotno-design-test-'));

function run(script, args) {
  return spawnSync(process.execPath, [path.join(__dirname, script), ...args], {
    cwd: __dirname,
    encoding: 'utf8'
  });
}

function write(name, value) {
  const file = path.join(temporaryDirectory, name);
  fs.writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value, null, 2));
  return file;
}

try {
  assert.equal(CHECK_INTERVAL_MS, 7 * 24 * 60 * 60 * 1000);
  const now = Date.parse('2026-08-18T00:00:00.000Z');
  const policy = '{"polotno":"^4.8.0"}';
  const versions = { polotno: '4.8.0' };
  const freshState = { checkedAt: new Date(now).toISOString(), policy };
  assert.equal(needsUpdate(null, policy, versions, now), true);
  assert.equal(needsUpdate(freshState, policy, null, now), true);
  assert.equal(needsUpdate(freshState, 'changed', versions, now), true);
  assert.equal(needsUpdate(freshState, policy, versions, now), false);
  assert.equal(
    needsUpdate(freshState, policy, versions, now + CHECK_INTERVAL_MS),
    true
  );

  const source = {
    schemaVersion: 4,
    width: 1080,
    height: 1080,
    unknownRootProperty: 'remove only in explicit output',
    pages: [
      {
        id: 'page-1',
        background: '#ffffff',
        children: [
          {
            id: 'title',
            type: 'text',
            x: 80,
            y: 80,
            width: 700,
            height: 120,
            text: 'A valid design',
            fontSize: 72,
            fontFamily: 'Inter'
          }
        ]
      }
    ]
  };
  const sourceFile = write('source.json', source);
  const originalText = fs.readFileSync(sourceFile, 'utf8');

  const validation = run('validate.js', [sourceFile]);
  assert.equal(validation.status, 0, validation.stderr || validation.stdout);
  assert.equal(fs.readFileSync(sourceFile, 'utf8'), originalText);

  const canonicalFile = path.join(temporaryDirectory, 'canonical.json');
  const normalization = run('validate.js', [sourceFile, '--normalize', canonicalFile]);
  assert.equal(normalization.status, 0, normalization.stderr || normalization.stdout);
  assert.equal(fs.readFileSync(sourceFile, 'utf8'), originalText);
  assert.equal(fs.existsSync(canonicalFile), true);
  const normalizationReport = JSON.parse(normalization.stdout);
  assert.equal(normalizationReport.changed, true);
  assert.equal(
    normalizationReport.delta.removedPaths.includes('/unknownRootProperty'),
    true
  );

  const canonicalValidation = run('validate.js', [canonicalFile, '--mode', 'canonical']);
  assert.equal(
    canonicalValidation.status,
    0,
    canonicalValidation.stderr || canonicalValidation.stdout
  );

  const invalidFile = write('invalid.json', '{invalid');
  const invalidText = fs.readFileSync(invalidFile, 'utf8');
  const invalidValidation = run('validate.js', [invalidFile]);
  assert.equal(invalidValidation.status, 1);
  assert.equal(fs.readFileSync(invalidFile, 'utf8'), invalidText);

  const nullFile = write('null.json', 'null');
  const nullLint = run('lint.js', [nullFile]);
  assert.equal(nullLint.status, 1);
  assert.equal(JSON.parse(nullLint.stdout).errors[0].rule, 'json-shape');

  const malformedArraysFile = write('malformed-arrays.json', {
    schemaVersion: 4,
    fonts: {},
    pages: {}
  });
  const malformedArraysLint = run('lint.js', [malformedArraysFile]);
  assert.equal(malformedArraysLint.status, 1);
  assert.equal(
    JSON.parse(malformedArraysLint.stdout).errors.every((error) => error.rule === 'json-shape'),
    true
  );

  assert.notEqual(
    textFitWarning({
      text: 'oneverylongword',
      width: 20,
      height: 20,
      fontSize: 20,
      lineHeight: 1.2,
      letterSpacing: 0
    }),
    null
  );

  const badDesign = {
    schemaVersion: 4,
    width: 100,
    height: 100,
    dpi: 300,
    pages: [
      {
        id: 'page-1',
        children: [
          {
            id: 'duplicate',
            type: 'group',
            children: [
              {
                id: 'nested-image',
                type: 'image',
                x: 0,
                y: 0,
                width: 50,
                height: 50,
                src: '${photo:test}'
              }
            ]
          },
          {
            id: 'duplicate',
            type: 'text',
            x: 120,
            y: 0,
            width: 20,
            height: 10,
            text: 'Lorem ipsum text that cannot fit',
            fontSize: 20,
            fontFamily: 'Unknown Test Font',
            letterSpacing: 10
          },
          {
            id: 'empty-asset',
            type: 'svg',
            x: 0,
            y: 0,
            width: 10,
            height: 10,
            src: ''
          }
        ]
      }
    ]
  };
  const badFile = write('bad.json', badDesign);
  const lint = run('lint.js', [badFile]);
  assert.equal(lint.status, 1, lint.stderr || lint.stdout);
  const lintReport = JSON.parse(lint.stdout);
  const errorRules = new Set(lintReport.errors.map((error) => error.rule));
  const warningRules = new Set(lintReport.warnings.map((warning) => warning.rule));
  assert.equal(errorRules.has('duplicate-id'), true);
  assert.equal(errorRules.has('placeholder-residue'), true);
  assert.equal(errorRules.has('asset-source'), true);
  assert.equal(errorRules.has('out-of-bounds'), true);
  assert.equal(warningRules.has('font-unknown'), true);
  assert.equal(warningRules.has('text-fit'), true);
  assert.equal(warningRules.has('print-bleed'), true);

  console.log('polotno-design script tests passed');
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}
