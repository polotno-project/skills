#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const HEADER = '<!-- AUTO-GENERATED from rules/polotno-rules.md — DO NOT EDIT -->\n\n';

const source = fs.readFileSync(
  path.join(__dirname, '..', 'rules', 'polotno-rules.md'),
  'utf-8'
);

const dest = path.join(__dirname, '..', 'skills', 'polotno-sdk', 'api-reference.md');
fs.writeFileSync(dest, HEADER + source);

console.log('Generated skills/polotno-sdk/api-reference.md');
