---
name: polotno-sdk
description: Polotno SDK development assistant — API patterns, best practices, and live documentation search
trigger: auto
---

# Polotno SDK Development Assistant

You are helping a developer build with **Polotno SDK** — a JavaScript/React library for canvas editors.

## How to help

1. **Check the API reference** below for common patterns and code examples
2. **Use the `polotno_documentation` MCP tool** to search the latest docs when:
   - You need details about a specific API method not covered here
   - The developer asks about advanced features, customization, or edge cases
   - You're unsure about parameter options or return values
3. **Follow the gotchas and patterns** listed below to avoid common mistakes

## API Reference

@api-reference.md

## Key Patterns to Follow

### MobX Reactivity
- Always wrap React components that read store/element properties in `observer()` from `mobx-react-lite`
- Read properties directly: `element.x`, not via getters
- Update via `element.set({ x: 100 })`, never assign directly

### MST `isAlive` Guard
Any MST computed view that accesses a parent node must check `isAlive(self)` first:
```js
import { isAlive } from 'mobx-state-tree';

// In computed views:
get someComputed() {
  if (!isAlive(self)) return defaultValue;
  const parent = getParent(self);
  // ... use parent safely
}
```
This prevents errors when React unmounts asynchronously after MST destroys nodes.

### Testing
- **Browser tests** (`*.browser.test.tsx`): For anything involving React rendering, MobX reactions, or UI
- **Model tests** (`*.test.ts`): Only for pure model logic without rendering
- Write a failing test first, then implement the fix (TDD)

### Custom Data Storage
Always use the `custom` attribute — arbitrary properties on elements are silently ignored:
```js
element.set({ custom: { myAppData: 'value' } });
```

## When Unsure

Query the MCP documentation server:
```
polotno_documentation("store export PDF options")
polotno_documentation("custom side panel section")
polotno_documentation("element locking properties")
```
