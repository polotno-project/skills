# Polotno Skills — Design Spec

Handoff document for `/writing-great-skills`. Captures the decisions from the design
interview, the verified technical facts, and the prior-art autopsy.

## 0. Context & motivation

Two skills exist in embryonic form (`skills/polotno-sdk/`, `polotno/`) plus a prior-art
generation pipeline (`src/`). None was finalized. This is a ground-up rethink: existing
files are **raw material, not constraints**. The core unsolved problem is **making an AI
agent produce designs that look professionally designed**, not just valid.

## 1. Architecture: two independent, self-contained skills

No shared-core layer (accepted minor duplication over indirection). Routing is by *job*,
driven mainly by each skill's description.

| Skill | Job | Audience |
|---|---|---|
| `polotno-sdk` | Integrate the Polotno **editor** into an app (React, MobX/MST, store API, SidePanel/Workspace/Toolbar) | Developers embedding an editor |
| `polotno-design` | **Generate, validate, render, and bulk-produce** designs headlessly from a brief | Developers / automation builders in a terminal |

## 2. `polotno-sdk` (lighter scope)

Largely keep what exists; **polish + regenerate against schemaVersion 4**. Retains MCP doc
search. Not the focus of this effort. No architectural change.

## 3. `polotno-design` (the real work)

### 3.1 Environment & capability
- **Terminal-only** assumption (npm, node helper scripts). The no-terminal "designer"
  persona is an explicit **non-goal**.
- **Claude-Code-first**, assuming **vision + terminal**. Ship via both the Claude Code
  plugin and the cross-platform `skills` CLI. **Degrade gracefully**: where vision/terminal
  are absent, fall back to generate → deterministic-validate → render with **no
  self-critique** — and say so honestly (never claim "design generated" when it never saw
  the render).

### 3.2 Two modes (sequenced)
1. **From-scratch generation** (primary, hard — build & ship first). The current template
   library is too poor to lean on; from-scratch output becomes the seed for a *future*
   template library.
2. **Template + bulk** (second mode, same skill — built on top). Take a good generated
   design → mark text/image slots (via the `custom` attribute) → substitute from data/CSV
   → render N variants. Mechanically cheap; reuses 100% of the plumbing.

### 3.3 From-scratch engine (the pipeline)
```
brief → enrich → pick archetype + design tokens → generate Polotno JSON (direct)
      → normalizeDesign + validateDesign + deterministic geometric fixers
      → resolve assets (agent picks best from top-N, not items[0])
      → render small preview PNG → agent READS it → critique vs rubric
      → edit JSON → loop → final full-res export
```
- **Representation: direct Polotno JSON.** SVG-intermediate path is **killed** (tried
  before, "always ugly"; visual loop covers its only benefit). Optional later bake-off, but
  not in the skill.
- **Taste injection = archetypes + tokens + rubric** (not a branded template library):
  - **Layout archetypes**: small set of composition patterns (centered hero, rule-of-thirds
    w/ image bleed, split, stacked-card…) as parametric guidance (zones, proportions, focal
    point).
  - **Design tokens**: generated palette + type scale per design.
  - **Design rubric**: explicit checklist (hierarchy, type scale, spacing/grid,
    contrast/legibility, alignment, palette discipline, intentional whitespace). **Both**
    generation and critique apply it; the loop scores against the rubric, not vibes.

### 3.4 Visual loop (default = "standard")
- Single candidate, iterated until rubric passes, **cap ~3 passes**.
- Selectable modes: **quick** (1 generate + 1 fix), **best** (multi-candidate ×3, iterate
  each, pick best — opt-in, ~3× cost).
- **Small preview during loop** (~512px) for speed; **full-res only at the end**.

### 3.5 Helper scripts shipped with the skill
Don't make the model re-derive plumbing each run. Ship runnable scripts; agent orchestrates:
- `validate.js` — `normalizeDesign(partial)` → `validateDesign(json,{mode:'canonical'})` →
  harvested geometric fixers; returns structured `errors[]` to feed back into the loop.
- `resolve-assets.js` — `${photo:query}`/`${icon:query}` → real URLs via Polotno proxy;
  **fetch top-N, agent picks by looking**.
- `render.js` — `polotno-node` preview/full render (Puppeteer/Chromium under the hood).
- Documented `npm install` (deps: `polotno-node`, `@polotno/schema`, `axios`).

### 3.6 Assets
- "No API" meant **no LLM API calls** (the agent itself is the generator). **Asset search
  is allowed.**
- Photos (Unsplash) + icons (Noun Project) resolve through **Polotno's own proxy**
  (`api.polotno.com/api/get-unsplash`, `get-nounproject`), authed with the **same Polotno
  key** as rendering — no separate keys.
- **User-supplied assets** supported on request.
- Vector designs (typography + figures + icons) are the most reliable/tasteful lane and
  need no photo search — favor where the brief fits.

## 4. Verified technical facts
- **One key for everything**: rendering + asset search. Public **demo key**
  `nFA5H9elEytDyPyvKL7T` works for the loop; user swaps own key for production.
- **`@polotno/schema` v0.1.4**: `normalizeDesign` (fills defaults, strips unknown keys —
  lets the agent write *minimal* JSON), `validateDesign` (returns
  `{valid, errors:[{path,message}]}`), ships `design.schema.json`. Production use needs a
  Polotno subscription.
- **Current format is schemaVersion 4.** ⚠️ All `src/`, `polotno/rules/*`, and example
  JSONs use **schemaVersion 1 — stale**. Design-model knowledge for the skill should be
  **generated from `@polotno/schema`'s published JSON Schema**, not hand-maintained.
- `polotno-node`: `instance.jsonTo{Image,PDF,GIF,Video}{Base64,DataURL,File}`, attrs
  forwarded to store export.

## 5. Harvest from `src/` (keep) vs reject
**Keep:** deterministic validators/fixers (bounds clamp/remove, text-overflow math,
font-name validation vs Google Fonts, figure `subType` whitelist, filter-structure
`{intensity:n}` repair); `${photo:}`/`${icon:}` placeholder + query-shortening retry;
vector-vs-photo design-type heuristic.

**Reject:** the one-shot-no-feedback architecture; the LLM-API plumbing
(openai/anthropic/gemini clients); **the "canvas-filling" rules** (`src/json-generator.js`
lines 293–298: "fill 80%, content in all three vertical thirds, distribute evenly, no empty
regions") — these are *anti-taste*, they produce the cluttered soulless look by optimizing
against whitespace; the SVG-first path.

## 6. Non-goals
No-terminal designers; SVG-intermediate generation; cross-platform parity at the cost of
the visual loop; a curated branded template library (we generate our own seeds instead); a
third skill for bulk.

## 7. Disposition of existing files
- `skills/polotno-sdk/` → polish, regen API reference vs schemaVersion 4.
- `polotno/` (rules + assets) → source for harvest; **regenerate all against
  schemaVersion 4**; fold useful design-model docs into `polotno-design`.
- `src/` → mine the validators (§5), then retire the pipeline.

## 8. Build sequencing
1. From-scratch engine: archetypes + tokens + rubric + helper scripts + visual loop → ship.
2. Bulk/template mode as the same skill's second workflow.
3. (Optional) SVG-vs-JSON bake-off; photo-selection quality tuning; grow the seeded
   template library.

## 9. Still-soft (not blocking, needs authoring)
- The actual **archetype set and rubric content** — the real taste artifacts.
- The **slot-binding convention** for bulk (likely `custom`-attribute based).
