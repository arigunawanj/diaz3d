# Diaz3D Decor Configurator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `diaz3d` into a desent-style 3D decoration configurator. Customers design freely, see a live price (base package + add-ons), and submit to an admin panel. The admin approves or revises the price and sends the result to the customer's WhatsApp.

**Architecture:** Pure TypeScript domain modules in `src/domain/` define the design model, catalog, presets, pricing, validation, and the WhatsApp message. They have no React or Next imports, are tested with `node --test`, and are shared by client and server. The client editor is a reducer over `Design`, rendered by React Three Fiber, with GSAP motion. The server uses Next.js route handlers and Prisma + SQLite to store submissions and catalog prices. A single-password admin session is signed with HMAC (Web Crypto) and checked in middleware.

**Tech Stack:**
- Existing: Next.js 14 App Router, React 18, three 0.160, @react-three/fiber 8, @react-three/drei 9, gsap 3.12, Tailwind 4, lucide-react.
- New: `prisma@^6` and `@prisma/client@^6`.
- Tests: Node 26 built-in test runner with native TypeScript type stripping.

**Spec:** `docs/superpowers/specs/2026-10-16-decor-configurator-design.md`

## Global Constraints

- UI language: Bahasa Indonesia. Currency is formatted with `Intl.NumberFormat('id-ID')`, giving output like `Rp2.900.000` (no space, no decimals).
- Base package price is `2500000`. It includes installation, transport, 1 panel, 4.5 m garland, and all of the preset's default items.
- Add-on prices (seed values; `CatalogId` in parentheses):

  | Item | Price |
  |---|---|
  | panel (`panel`) | 400000 per panel above included |
  | character 100 cm (`karakter`) | 100000 |
  | marquee number (`angka-lampu`) | 250000 per digit item |
  | cake table (`meja-kue`) | 50000 |
  | balloon accent (`aksen-balon`) | 150000 per design |
  | garland (`garland-meter`) | 250000 per meter above included |
  | backdrop LED (`led-backdrop`) | 150000 |
  | balloon column (`tiang-balon`) | 200000 |
  | jumbo balloon (`balon-jumbo`) | 75000 |
  | hanging balloon (`balon-gantung`) | 25000 |
  | neon name sign (`neon-nama`) | 350000 |
  | carpet (`karpet`) | 150000 |
  | standing flower (`standing-flower`) | 300000 |
  | big plant (`tanaman`) | 100000 |
  | spotlight (`lampu-sorot`) | 100000 |
  | formal table (`meja-formal`) | 200000 |

  Colours, text, patterns, finish, floor, and light are free.
- Removing an included item never lowers the price. Swapping a variant (which character, which digit, table style) is free, because pricing counts by `catalogId`, not by variant.
- Preset contents live in code. The included quantities are derived from the preset's own design (`countUsage(preset.design)`). The admin edits prices and the active flag only.
- Limits:
  - `panelCount` 1–4
  - garland `lengthM` 4.5–20, step 0.5
  - palette 2–5 colours
  - at most 40 placed items
  - stage floor bounds x ∈ [-3.2, 3.2], z ∈ [0.4, 3.0] (backdrop sits at z ≈ 0)
- Files in `src/domain/` import each other only by relative path with an explicit `.ts` extension. They use no `@/` alias, no enums, no namespaces, and no parameter properties, so `node --test` can run them directly.
- Every animation honours `prefers-reduced-motion` (duration 0), following the pattern already in `src/components/3d/Scene.tsx`.
- Visual direction follows desent.arigunawanj.com:
  - colours: background `#F6F3EE`, surface `#FFFDF9`, text `#1F1E1C`, muted `#8A847B`, accent `#C2552B`, dark bar `#262524`
  - font: Inter via `next/font/google`
  - shape: rounded cards with thin borders

## Review Focus

1. **WhatsApp number typed in any common format** (`0812-3456-7890`, `+62 812 3456 7890`, `812345678`). It should be stored as `62812…`. Garbage like `123` should be rejected with a clear message. The test goes in Task 3.
2. **A tampered or stale client payload** (unknown `catalogId`, `panelCount: 99`, a negative garland length, a faked `estimate`). The server should reject invalid designs and always recompute the price itself. Tests go in Tasks 3 and 8.
3. **Reload mid-design, including a corrupt `localStorage` draft.** The draft should be restored, or the editor should fall back to the default preset without crashing. The test goes in Task 4.
4. **Catalog price changed after a submission.** The old submission should keep its snapshot lines and estimate. The test goes in Task 8.
5. **An item dragged off the stage or into the backdrop.** It should be clamped to the stage bounds. The test goes in Task 4.

---

## File Structure

```
src/domain/
  design.ts        Design types, CatalogId, constants (limits, STAGE_BOUNDS)
  catalog.ts       DEFAULT_CATALOG, BASE_PACKAGE_PRICE
  presets.ts       PRESETS (6: 2 per template), getPreset
  pricing.ts       countUsage, priceDesign, formatIDR
  validate.ts      parseDesign, normalizeWa, ValidationError
  editor.ts        designReducer, EditorAction, clampToStage, loadDraft
  whatsapp.ts      buildWaMessage, waLink
  session.ts       signSession, verifySession (Web Crypto HMAC)
  revision.ts      FinalLine, parseFinalLines, totalOf
tests/*.test.ts    one file per domain module
src/server/
  db.ts            Prisma client singleton
  pricingContext.ts getPricingContext()
  submissions.ts   createSubmission, codes/tokens, screenshot write
prisma/schema.prisma, prisma/seed.ts
src/components/3d/  DecorScene + item renderers (rewrite of existing files)
src/components/configurator/  Configurator, LeftPanel, CatalogTab*, Inspector, BottomBar, PriceDrawer, SubmitModal, ...
src/app/page.tsx (server), src/app/d/[code]/page.tsx, src/app/admin/**, src/app/api/**
src/middleware.ts
```

Old `src/types/decoration.ts`, `src/lib/constants.ts`, `src/components/ui/*` are deleted in Task 7 once nothing imports them. Keep `src/lib/decorGeometry.ts`, `textures.ts`, `characterSVGs.ts`, `scripts/check-decoration.cjs`.

---

### Task 1: Repo setup + domain model, catalog, presets

**Files:**
- Create: `.gitignore`, `src/domain/design.ts`, `src/domain/catalog.ts`, `src/domain/presets.ts`, `tests/presets.test.ts`
- Modify: `package.json` (add `"test": "node --test tests/"`), `tsconfig.json` (add `"allowImportingTsExtensions": true`)

**Interfaces:**
- Produces:
  - `type TemplateType = 'anak' | 'sweet17' | 'formal'`
  - `type CatalogId = 'panel' | 'karakter' | 'angka-lampu' | 'meja-kue' | 'aksen-balon' | 'garland-meter' | 'led-backdrop' | 'tiang-balon' | 'balon-jumbo' | 'balon-gantung' | 'neon-nama' | 'karpet' | 'standing-flower' | 'tanaman' | 'lampu-sorot' | 'meja-formal'`
  - `const PLACEABLE_IDS: CatalogId[]`: every id except `panel`, `garland-meter`, `led-backdrop`, `aksen-balon`.
  - `interface PlacedItem { uid: string; catalogId: CatalogId; position: [number, number]; rotationY: number; params: Record<string, string | number | boolean> }`. `position` is `[x, z]` on the floor.
  - `interface Design`, exactly:
    ```ts
    {
      version: 1;
      templateType: TemplateType;
      presetId: string;
      backdrop: {
        panelCount: number;
        shape: 'double-arch' | 'single-arch' | 'wavy' | 'round' | 'half-arch';
        mainColor: string;
        secondaryColor: string;
        title: string;
        subtitle: string;
        textColor: string;
        font: 'serif' | 'script' | 'modern';
        led: boolean;
        ledColor: string;
      };
      garland: {
        visible: boolean;
        palette: string[];
        lengthM: number;
        sizes: { s5: boolean; s12: boolean; s18: boolean };
        density: 'jarang' | 'sedang' | 'padat';
        finish: 'glossy' | 'doff' | 'metalik' | 'chrome';
        pattern: 'polos' | 'dalmatian' | 'polka';
        leafAccent: boolean;
      };
      items: PlacedItem[];
      environment: {
        floor: 'wood' | 'marble' | 'checkered';
        light: 'hangat' | 'netral' | 'dramatis';
      };
    }
    ```
  - `const LIMITS = { panelMin: 1, panelMax: 4, garlandMin: 4.5, garlandMax: 20, garlandStep: 0.5, paletteMin: 2, paletteMax: 5, maxItems: 40 }`
  - `const STAGE_BOUNDS = { minX: -3.2, maxX: 3.2, minZ: 0.4, maxZ: 3.0 }`
  - `interface CatalogItem { id: CatalogId; name: string; category: 'backdrop' | 'balon' | 'properti'; price: number; unit: string; active: boolean }`
  - `DEFAULT_CATALOG: CatalogItem[]` uses the Global Constraints prices. Its Indonesian names and units are the builder's choice.
  - `BASE_PACKAGE_PRICE = 2500000`
  - `interface Preset { id: string; templateType: TemplateType; name: string; badge: string; description: string; design: Design }`
  - `PRESETS: Preset[]`
  - `getPreset(id: string): Preset | undefined`
  - `DEFAULT_PRESET_ID: string`

- [ ] **Step 1:** Run `git init`. Write `.gitignore` with `node_modules`, `.next`, `.superpowers`, `uploads`, `prisma/*.db*`, `.env`, `*.tsbuildinfo`. Then add the `test` script and the tsconfig flag.
- [ ] **Step 2: Write the failing test** `tests/presets.test.ts`:
  - `test('six presets, two per template')`: counts per `templateType` are 2/2/2.
  - `test('every preset obeys base package shape')`: for every preset, `design.backdrop.panelCount === 1`, `design.garland.lengthM === 4.5`, `items.length <= LIMITS.maxItems`, every item `catalogId` is in `PLACEABLE_IDS`, every position is inside `STAGE_BOUNDS`, and uids are unique.
  - `test('catalog covers every CatalogId once')`: `DEFAULT_CATALOG.map(c => c.id)` has 16 unique ids. The `panel` price is 400000 and `garland-meter` is 250000.
- [ ] **Step 3:** Run `npm test`. Expected: FAIL, because the modules are missing.
- [ ] **Step 4:** Implement the three domain files.
  - Presets per template:
    - anak: "Wild One Safari" and "Sweet Pastel Dream"
    - sweet17: "Rose Gold Glam" and "Midnight Neon"
    - formal: "Ivory Elegance" and "Emerald Gala"
  - Port colours from the existing `THEME_PRESETS` in `src/lib/constants.ts` where they fit.
  - Contents:
    - anak presets each include 2–3 `karakter` items, 1 `angka-lampu`, and 1 `meja-kue`.
    - sweet17 presets include 2 `angka-lampu` (digits 1 and 7) and 1 `meja-kue`.
    - formal presets include `meja-formal` and `standing-flower` ×2, with no characters.
  - `params` keys:
    - `karakter`: `{ character: 'giraffe' | 'lion' | 'elephant' | 'bear' | 'dino' | 'rabbit' | 'koala' | 'fox' | 'tiger' | 'astronaut' }`. Use the ids `getCharacterTexture` in `src/lib/characterSVGs.ts` accepts.
    - `angka-lampu`: `{ digit: number, lit: boolean }`
    - `meja-kue`: `{ style: 'smooth' | 'ribbed', color: string, cake: boolean }`
    - balloons: `{ color: string }`
    - `neon-nama`: `{ text: string, color: string }`
- [ ] **Step 5:** Run `npm test`. Expected: PASS.
- [ ] **Step 6:** Commit with `git add -A && git commit -m "feat(domain): design model, catalog, presets"`.

### Task 2: Pricing

**Files:**
- Create: `src/domain/pricing.ts`, `tests/pricing.test.ts`

**Interfaces:**
- Consumes: Task 1 types, `getPreset`.
- Produces:
  - `countUsage(d: Design): Record<CatalogId, number>`
    - `panel` = `panelCount`
    - `garland-meter` = `lengthM`, counted even when `visible` is false
    - `led-backdrop` = `led ? 1 : 0`
    - `aksen-balon` = `leafAccent ? 1 : 0`
    - every other id = the number of items with that `catalogId`
    - every id is present, with 0 when unused
  - `interface PriceLine { catalogId: CatalogId; name: string; unit: string; included: number; used: number; extraQty: number; unitPrice: number; subtotal: number }`
  - `interface PriceBreakdown { base: number; lines: PriceLine[]; total: number }`
  - `priceDesign(d: Design, catalog: CatalogItem[], basePrice: number): PriceBreakdown`
    - Included quantities come from `countUsage(getPreset(d.presetId)!.design)`.
    - An unknown preset means everything counts as included 0.
    - `extraQty = max(0, used - included)`.
    - `lines` holds every catalog item that has `used > 0`, including those with `extraQty` 0, so the UI can show "Termasuk paket".
    - `total = base + Σ subtotal`.
    - An inactive catalog item is still priced if it is present.
  - `formatIDR(n: number): string`

- [ ] **Step 1: Write the failing tests:**
  - `default preset costs base`: for each preset P, `priceDesign(P.design, DEFAULT_CATALOG, 2500000).total === 2500000`.
  - `second panel adds 400000`: panelCount 2 gives total 2900000.
  - `garland 6m adds 375000`: total 2875000, and the garland line has `extraQty === 1.5`.
  - `removing an included item does not lower total`: dropping one `karakter` from an anak preset leaves the total at 2500000.
  - `extra characters charged per unit`: adding 2 `karakter` beyond the included count gives +200000.
  - `variant swap is free`: changing `params.character` on an included character gives 2500000.
  - `led and accent toggles`: on a preset where both are off, turning them on gives +300000.
  - `formatIDR(2900000) === 'Rp2.900.000'`. Normalize the NBSP that `Intl` inserts by removing any whitespace after `Rp`.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement `pricing.ts`.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit with `feat(domain): pricing`.

### Task 3: Validation, WhatsApp, revision

**Files:**
- Create: `src/domain/validate.ts`, `src/domain/whatsapp.ts`, `src/domain/revision.ts`, `tests/validate.test.ts`, `tests/whatsapp.test.ts`, `tests/revision.test.ts`

**Interfaces:**
- Produces:
  - `class ValidationError extends Error { field: string }`. Assign the field in the constructor body, not as a parameter property.
  - `parseDesign(input: unknown): Design`
    - Throws `ValidationError` on any shape error: an unknown preset, an unknown or non-placeable `catalogId`, numbers out of `LIMITS`, `lengthM` not a multiple of 0.5, a palette or colour that is not `#RRGGBB`, a position outside `STAGE_BOUNDS`, more than 40 items, or a text field longer than 40 chars.
    - Returns a fresh, deep-copied object holding only the known keys.
  - `normalizeWa(raw: string): string`
    - Strips spaces, dashes, dots, and parentheses.
    - Converts a leading `+62` to `62`, a leading `0` to `62`, and a leading `8` to `628`.
    - The result must match `/^628\d{7,11}$/`. Otherwise it throws `ValidationError('Nomor WhatsApp tidak valid', 'wa')`.
  - `interface WaMessageInput { code: string; name: string; status: 'DISETUJUI' | 'DIREVISI'; lines: FinalLine[]; finalPrice: number; adminNote: string; viewUrl: string }`
  - `buildWaMessage(i: WaMessageInput): string`
  - `waLink(phone62: string, text: string): string`, which returns `https://wa.me/${phone62}?text=${encodeURIComponent(text)}`
  - `interface FinalLine { label: string; amount: number }`
  - `parseFinalLines(input: unknown): FinalLine[]`
    - The input must be a non-empty array of at most 40 lines.
    - Each label is 1–80 chars.
    - Each amount is an integer, and may be negative for a discount.
    - The total must be > 0.
    - Throws `ValidationError` otherwise.
  - `totalOf(lines: FinalLine[]): number`

- [ ] **Step 1: Write the failing tests:**
  - **validate:**
    - Every preset design round-trips through `parseDesign` unchanged (`deepEqual`).
    - These throw, with `field` matching: `panelCount: 99` → `backdrop.panelCount`; `lengthM: -1`; `lengthM: 5.3`; `catalogId: 'hack'`; `catalogId: 'panel'` as a placed item; position `[10, 0]`; 41 items; `mainColor: 'red'`; a `null` input; extra unknown top-level keys (which are dropped, not thrown).
  - **normalizeWa:**
    - `'0812-3456-7890'` gives `'6281234567890'`.
    - `'+62 812 3456 7890'` gives the same.
    - `'812345678'` gives `'62812345678'`.
    - `'123'` and `''` throw.
  - **whatsapp:**
    - The message contains the code, the name, `Rp2.900.000`, the admin note, and the view URL.
    - `waLink('6281234567890', 'a b&c')` equals `'https://wa.me/6281234567890?text=a%20b%26c'`.
  - **revision:**
    - `totalOf([{label:'Paket',amount:2500000},{label:'Diskon',amount:-100000}]) === 2400000`.
    - `parseFinalLines([])` throws.
    - A total of ≤ 0 throws.
    - An amount of `1.5` throws.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement the three modules. Write the message copy in Indonesian, with one line per `FinalLine` formatted using `formatIDR`.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit with `feat(domain): validation, whatsapp, revision`.

### Task 4: Editor reducer + draft persistence

**Files:**
- Create: `src/domain/editor.ts`, `tests/editor.test.ts`

**Interfaces:**
- Consumes: Tasks 1 and 3 (`parseDesign` for drafts).
- Produces:
  - `type EditorAction` covers:
    - `{ type: 'applyPreset'; presetId: string }`
    - `{ type: 'addItem'; uid: string; catalogId: CatalogId; position?: [number, number]; params?: PlacedItem['params'] }`
    - `{ type: 'removeItem'; uid: string }`
    - `{ type: 'moveItem'; uid: string; position: [number, number] }`
    - `{ type: 'rotateItem'; uid: string; deltaY: number }`
    - `{ type: 'duplicateItem'; uid: string; newUid: string }`
    - `{ type: 'updateItemParams'; uid: string; params: PlacedItem['params'] }` (merged)
    - `{ type: 'setBackdrop'; patch: Partial<Design['backdrop']> }`
    - `{ type: 'setGarland'; patch: Partial<Design['garland']> }`
    - `{ type: 'setEnvironment'; patch: Partial<Design['environment']> }`
  - `designReducer(state: Design, action: EditorAction): Design`
    - Pure: it returns a new object and the input is never mutated.
    - `panelCount` and `lengthM` are clamped and snapped to the limits.
    - `palette` is trimmed to the 2–5 range, and a set that would drop below 2 is ignored.
    - `addItem` past 40 items, or with a non-placeable id, returns the state unchanged.
    - When no position is given, `addItem` uses the default spot `DEFAULT_DROP: [0, 1.6]` nudged by `0.35 × (count of same catalogId)` on x, then clamped.
    - `duplicateItem` offsets the copy by +0.4 x, then clamps.
    - `applyPreset` returns a deep copy of the preset design, or the state unchanged when the id is unknown.
  - `clampToStage(p: [number, number]): [number, number]`
  - `DRAFT_KEY = 'diaz3d:draft:v1'`
  - `loadDraft(storage: Pick<Storage, 'getItem'> | null): Design`, which returns `parseDesign(JSON.parse(raw))`, or the default preset design when storage is missing, throws, or holds invalid data.
  - `saveDraft(storage: Pick<Storage, 'setItem'> | null, d: Design): void`, which swallows errors.

- [ ] **Step 1: Write the failing tests:**
  - `moveItem` to `[9, -5]` clamps to `[3.2, 0.4]`.
  - `setBackdrop({panelCount: 7})` gives 4, and `0` gives 1.
  - `setGarland({lengthM: 6.3})` gives 6.5, and `2` gives 4.5.
  - `addItem` 41 times stops at 40.
  - `addItem` with `catalogId: 'panel'` is a no-op.
  - The reducer does not mutate its input (deep-freeze the input in the test).
  - `applyPreset` to an unknown id is a no-op.
  - `loadDraft` returns the default preset for `null` storage, for `getItem` returning `'{broken'`, for a valid JSON but invalid design, and for `getItem` throwing.
  - `loadDraft` returns the saved design for a valid one.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement `editor.ts`.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit with `feat(domain): editor reducer and draft`.

### Task 5: 3D scene renders a `Design`

**Files:**
- Create: `src/components/3d/DecorScene.tsx`, `src/components/3d/items/registry.tsx`, plus one file per item renderer in `src/components/3d/items/` (`Character.tsx`, `MarqueeDigit.tsx`, `CakeTable.tsx`, `BalloonColumn.tsx`, `JumboBalloon.tsx`, `HangingBalloons.tsx`, `NeonSign.tsx`, `Carpet.tsx`, `StandingFlower.tsx`, `Plant.tsx`, `Spotlight.tsx`, `FormalTable.tsx`)
- Modify: `src/components/3d/Backdrop.tsx` (N panels), `src/components/3d/BalloonGarland.tsx` (driven by `Design['garland']` and `panelCount`), `src/lib/decorGeometry.ts` (`buildBalloonLayout(opts)`), `scripts/check-decoration.cjs`
- Reuse (adapt props): `StudioStage.tsx`, `CharacterCutouts.tsx`, `MarqueeNumber.tsx`, `PedestalAndCake.tsx`, `Foliage.tsx`
- Delete: `src/components/3d/Scene.tsx` once DecorScene replaces it (at the end of Task 7)

**Interfaces:**
- Consumes: `Design`, `PlacedItem`.
- Produces:
  - `DecorScene` props:
    - `design: Design`
    - `selectedUid: string | null`
    - `onSelect(uid: string | null): void`
    - `onMoveItem(uid: string, pos: [number, number]): void`
    - `onDropCatalog(catalogId: CatalogId, pos: [number, number]): void`
    - `cameraView: 'front' | 'angle' | 'top' | 'closeup'`
    - `focusUid: string | null`
    - `canvasRef: RefObject<HTMLCanvasElement>`
    - `readOnly?: boolean`
  - `ITEM_RENDERERS: Record<PlacedCatalogId, React.FC<{ item: PlacedItem; selected: boolean }>>`
  - `buildBalloonLayout(opts: { panelCount: number; lengthM: number; density: 'jarang' | 'sedang' | 'padat'; sizes: { s5: boolean; s12: boolean; s18: boolean } }): BalloonSpec[]`
    - Deterministic, as the existing check requires.
    - The arch covers the backdrop width.
    - Length beyond 4.5 m continues down the sides to the floor.
    - Balloon count grows with `lengthM`.

- [ ] **Step 1:** Update `scripts/check-decoration.cjs`:
  - Assert that `buildBalloonLayout({panelCount:1,lengthM:4.5,density:'sedang',sizes:{s5:true,s12:true,s18:true}})` is deterministic and that no balloon sinks below the floor (keep the existing assertions).
  - Assert that the count for `lengthM: 6` is greater than for `4.5`.
  - Assert that the x-extent for `panelCount: 3` is greater than for `1`.
  - Run `node scripts/check-decoration.cjs`. Expected: FAIL.
- [ ] **Step 2:** Implement `buildBalloonLayout(opts)` and the garland, using an `InstancedMesh` and the palette cycling through instances. Run the check. Expected: PASS.
- [ ] **Step 3:** Implement `Backdrop` with panels laid side by side (panel width ≈ 2.2, centred), `DecorScene`, and the renderers. Port the camera rig from `Scene.tsx`, adding a `focusUid` GSAP tween that moves the target to the item.
  - Selected item: a terracotta outline or ring on the floor.
  - Enter animation: GSAP scale 0 → 1 with `back.out(1.7)`, starting a little above the floor and settling down.
  - Exit animation: scale → 0 over 0.25 s, then unmount. Keep a local "leaving" list keyed by uid.
  - Colour changes: tween `material.color` over 0.4 s.
  - Shadows: off and DPR ≤ 1.5 when `matchMedia('(max-width: 767px)')` matches.
- [ ] **Step 4:** Mount `DecorScene` temporarily in `src/app/page.tsx` with each preset (add a dev-only preset `<select>`). Then `npm run dev`. In the browser pane, check every preset:
  - all items are visible on the stage
  - panelCount 1 → 3 widens the backdrop and garland
  - garland 4.5 → 8 m adds balloons down the sides
  - there are no console errors
- [ ] **Step 5:** Run `npm run build`. Expected: success. Commit with `feat(3d): render Design with N panels, garland, item registry`.

### Task 6: Drag & drop, selection, floating toolbar

**Files:**
- Create: `src/components/3d/DragPlane.tsx`, `src/components/3d/ItemToolbar.tsx`
- Modify: `src/components/3d/DecorScene.tsx`

**Interfaces:**
- Consumes: the `DecorScene` props from Task 5, and `clampToStage` from Task 4.
- Produces:
  - HTML5 drop on the canvas wrapper. The drag payload is `application/x-diaz3d-catalog` holding `CatalogId`. The pointer is raycast to the plane `y = 0`, then the code calls `onDropCatalog(id, clampToStage([x, z]))`.
  - Pointer-drag of a selected item along the floor. OrbitControls is disabled while dragging. The code calls `onMoveItem` on every frame (throttled with rAF) with the clamped position.
  - `ItemToolbar` is a drei `<Html>` above the selected item with buttons Geser (focus), Putar (+45°), Duplikat, and Hapus. Its props are:
    - `onRotate(uid)`
    - `onDuplicate(uid)`
    - `onDelete(uid)`
    - each button has an `aria-label`
  - Clicking empty floor calls `onSelect(null)`.
  - On touch devices, dragging starts after a 250 ms press on the item, so one-finger orbit still works.

- [ ] **Step 1:** Implement. Wire it into the temporary page from Task 5.
- [ ] **Step 2:** Verify in the browser pane:
  - dragging a catalog payload (simulate with a dev button calling `onDropCatalog`) places the item where the pointer is
  - dragging an item past the stage edge stops it at the bound
  - the toolbar buttons rotate, duplicate, and delete
  - camera orbit works when nothing is selected
- [ ] **Step 3:** Commit with `feat(3d): drag and drop, selection toolbar`.

### Task 7: Desent-style page + adaptive left panel + bottom bar

**Files:**
- Create in `src/components/configurator/`: `Configurator.tsx` (client root: reducer, selection, draft save), `LeftPanel.tsx`, `CatalogTabs.tsx`, `TemplateTab.tsx`, `BackdropTab.tsx`, `BalloonTab.tsx`, `PropertiTab.tsx`, `Inspector.tsx`, `BottomBar.tsx`, `PriceDrawer.tsx`, `ViewportOverlay.tsx`, `RollingNumber.tsx`
- Create: `src/components/site/Header.tsx`, `Hero.tsx`, `HowItWorks.tsx`, `Footer.tsx`
- Modify: `src/app/page.tsx` (server component; renders the site sections and `<Configurator catalog basePrice />`, using `DEFAULT_CATALOG` and `BASE_PACKAGE_PRICE` until Task 8), `src/app/layout.tsx` (Inter, metadata), `src/app/globals.css` (tokens from Global Constraints)
- Delete: `src/components/ui/*`, `src/types/decoration.ts`, `src/lib/constants.ts`, `src/components/3d/Scene.tsx`, and every import of them

**Interfaces:**
- Consumes:
  - `designReducer`, `loadDraft`, `saveDraft`, `priceDesign`, `formatIDR`
  - `DecorScene`
  - `PRESETS`
- Produces:
  - `Configurator` props: `{ catalog: CatalogItem[]; basePrice: number }`
  - `Configurator` exposes `onSubmitClick` to the `SubmitModal` added in Task 9 (render prop or internal state, the builder's call).
  - `RollingNumber` props: `{ value: number }`. It GSAP-tweens the displayed number and renders it with `formatIDR`.

- [ ] **Step 1:** Build the layout from spec §4.1, in this order: header → hero → configurator card → how-it-works (01 / DESAIN, 02 / LIHAT, 03 / AJUKAN) → footer.
  - Configurator card on desktop: left panel 38% and viewport, with the dark bottom bar spanning the card.
- [ ] **Step 2:** Build the left panel from spec §4.2–4.3.
  - With nothing selected, it shows the catalog tabs `Template · Backdrop · Balon · Properti`.
  - Catalog cards are draggable (setting the payload from Task 6) and clickable (dispatching `addItem` with `crypto.randomUUID()`).
  - Each card shows its price label from `priceDesign`:
    - "Termasuk paket" while used ≤ included
    - otherwise "+Rp…"
  - With an item selected, it shows the `Inspector`: "← Katalog", the item's params controls, the item's extra cost, and delete.
  - Backdrop and garland controls live in their tabs. Clicking the backdrop or garland in 3D opens that tab.
  - Applying a preset asks for confirmation (inline dialog) when the current design differs from its preset.
- [ ] **Step 3:** Build `ViewportOverlay`:
  - "● LIVE DECOR", the preset name, and a tagline
  - camera buttons and reset (reset re-applies the preset after confirmation)
  - "Seret untuk melihat sekeliling"
  - quick chips for "LED backdrop" and "Daun aksen", which toggle `led` and `leafAccent`
  - the bottom strip text from spec §4.1
- [ ] **Step 4:** Build `BottomBar` and `PriceDrawer`.
  - BottomBar shows "Dekorasimu, tersusun.", the item count, the estimate, a `RollingNumber` total, and an "Ajukan Desain →" button.
  - Clicking the total opens `PriceDrawer` with a "Paket dasar" line plus every `PriceLine`, labelled "Termasuk" or with an extra subtotal.
- [ ] **Step 5:** Mobile (< 768px):
  - viewport on top, at 55vh
  - left panel becomes a bottom sheet with half and full snap points (pointer drag on the handle, GSAP snap)
  - bottom bar sticky
- [ ] **Step 6:** Save the draft with `saveDraft(localStorage, design)`, debounced at 400 ms. Load it on mount with `loadDraft(localStorage)` inside `useEffect`, to avoid a hydration mismatch.
- [ ] **Step 7:** Verify in the browser pane at desktop and the `mobile` preset:
  - the default total shows `Rp2.500.000`
  - "+" on panel goes to `Rp2.900.000`, with the number rolling
  - the drawer lists "Panel backdrop ×1 · Rp400.000"
  - the reload keeps the design
  - keyboard Tab reaches every panel control
  - there are no console errors
  - `npm run build` passes
- [ ] **Step 8:** Commit with `feat(ui): desent-style configurator with adaptive panel`.

### Task 8: Database, catalog context, submissions API

**Files:**
- Create: `prisma/schema.prisma`, `prisma/seed.ts`, `src/server/db.ts`, `src/server/pricingContext.ts`, `src/server/submissions.ts`, `src/app/api/submissions/route.ts`, `src/app/api/uploads/[name]/route.ts`, `tests/submissions.test.ts`, `.env.example`
- Modify: `package.json`:
  - add `prisma@^6` and `@prisma/client@^6`
  - add the scripts `"db:push": "prisma db push"` and `"db:seed": "node prisma/seed.ts"`
  - add `"prisma": { "seed": "node prisma/seed.ts" }`
- Modify: `src/app/page.tsx` (use `getPricingContext()`)

**Interfaces:**
- Consumes: `parseDesign`, `normalizeWa`, `priceDesign`, `DEFAULT_CATALOG`, `BASE_PACKAGE_PRICE`.
- Produces:
  - Prisma models (SQLite, `DATABASE_URL="file:./dev.db"`):
    - `Submission`: `id` String cuid, `code` String unique, `token` String unique, `name`, `wa`, `eventDate` String, `location`, `notes` String default `""`, `designJson` String, `linesJson` String, `estimate` Int, `finalLinesJson` String?, `finalPrice` Int?, `status` String default `"MENUNGGU"` (`MENUNGGU` | `DISETUJUI` | `DIREVISI`), `adminNote` String default `""`, `screenshot` String?, `waSentAt` DateTime?, `createdAt`, `updatedAt`
    - `CatalogItem`: `id` String @id, `name`, `category`, `price` Int, `unit`, `active` Boolean
    - `Setting`: `key` String @id, `value` String. It holds `basePackagePrice`.
  - `getPricingContext(): Promise<{ catalog: CatalogItem[]; basePrice: number }>`. If the DB is empty, it falls back to `DEFAULT_CATALOG` and `BASE_PACKAGE_PRICE`.
  - `buildSubmissionRecord(input: unknown, ctx: { catalog: CatalogItem[]; basePrice: number }): { name; wa; eventDate; location; notes; design: Design; breakdown: PriceBreakdown }`
    - Pure, so it is testable.
    - Validates `name` (1–60), `wa` via `normalizeWa`, `eventDate` (an ISO `YYYY-MM-DD` date, not in the past relative to an injected `today: string` argument), `location` (1–80), `notes` (≤ 500), and `design` via `parseDesign`.
    - Ignores any client `estimate` field.
  - `makeCode(): string` returns `DZ-` plus 4 chars from `ABCDEFGHJKMNPQRSTUVWXYZ23456789`. `makeToken(): string` returns 24 hex chars from `crypto.randomBytes(12)`.
  - `POST /api/submissions`:
    - body: `{ name, wa, eventDate, location, notes?, design, screenshot?: string }`, where `screenshot` is a `data:image/png;base64,` string of at most 3 MB decoded
    - on success: `201 { code, token }`
    - on `ValidationError`: `400 { error, field }`
    - It retries `makeCode` on a unique collision.
    - It writes the PNG to `uploads/<token>.png`.
    - A missing or bad screenshot is skipped, not rejected.
  - `GET /api/uploads/[name]` serves only names matching `/^[a-f0-9]{24}\.png$/` from `uploads/`, with `image/png`. Anything else returns 404.

- [ ] **Step 1: Write the failing tests** for `buildSubmissionRecord`:
  - valid input gives `breakdown.total === 2900000` for a 2-panel design
  - a client `estimate: 1` is ignored
  - a bad WA throws with `field: 'wa'`
  - a past `eventDate` throws
  - an invalid design throws
  - catalog snapshot: build with `panel` at 400000, then build again with a catalog where `panel` is 500000. The first record's `breakdown` is unchanged; its lines are copied values, not references.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement `src/server/submissions.ts`. Keep `buildSubmissionRecord`, `makeCode`, and `makeToken` in a file that imports only `src/domain/*.ts` and `node:crypto`, so the test runs without Prisma. Then run `npm test`. Expected: PASS.
- [ ] **Step 4:** Add Prisma.
  - Install, write the schema, then write the seed: upsert `DEFAULT_CATALOG` and `basePackagePrice`, importing domain files by relative `.ts` path.
  - Write `db.ts` as a globalThis singleton.
  - Write the route handlers.
  - Set `export const runtime = 'nodejs'` on the routes.
  - Run `cp .env.example .env && npm run db:push && npm run db:seed`. Expected: 16 catalog rows.
- [ ] **Step 5:** Run `curl -s -X POST localhost:3000/api/submissions -H 'content-type: application/json' -d @<payload with preset design + panelCount 2 + estimate 1>`. Expected: `201` with a code matching `^DZ-`. The DB row has `estimate` 2900000.
- [ ] **Step 6:** Commit with `feat(server): prisma, pricing context, submissions API`.

### Task 9: Submit modal + success screen

**Files:**
- Create: `src/components/configurator/SubmitModal.tsx`
- Modify: `Configurator.tsx`

**Interfaces:**
- Consumes: `POST /api/submissions`, `priceDesign`, and `canvasRef` (the canvas already uses `preserveDrawingBuffer: true`).
- Produces:
  - The modal shows, in order: a screenshot preview (`canvas.toDataURL('image/png')` in try/catch; null on failure), the breakdown, then a form (Nama, Nomor WhatsApp, Tanggal acara `type=date` with `min` = today, Lokasi / kota, Catatan).
  - Server `400` errors show next to the named field.
  - On success, a screen shows the code, "Admin akan menghubungi kamu via WhatsApp", and a link to `/d/<code>?t=<token>`. The submit button is disabled while sending.

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** Verify in the browser pane:
  - a submission with WA `0812-3456-7890` succeeds and shows a code
  - WA `123` shows "Nomor WhatsApp tidak valid" under the field
  - the row exists in the DB (check with `npx prisma studio` or a sqlite query)
- [ ] **Step 3:** Commit with `feat(ui): submission modal`.

### Task 10: Admin session + middleware + login

**Files:**
- Create: `src/domain/session.ts`, `tests/session.test.ts`, `src/middleware.ts`, `src/app/admin/login/page.tsx`, `src/app/api/admin/login/route.ts`, `src/app/api/admin/logout/route.ts`
- Modify: `.env.example` (add `ADMIN_PASSWORD=`, `ADMIN_SESSION_SECRET=`, `PUBLIC_BASE_URL=http://localhost:3000`)

**Interfaces:**
- Produces:
  - `signSession(secret: string, expiresAtMs: number): Promise<string>` returns `"<expiresAtMs>.<base64url HMAC-SHA256>"`, using `crypto.subtle`.
  - `verifySession(secret: string, token: string | undefined, nowMs: number): Promise<boolean>`
  - Cookie: `diaz3d_admin`, httpOnly, sameSite `lax`, `secure` in production, lasting 7 days.
  - Middleware matcher `['/admin/:path*', '/api/admin/:path*']`, excluding `/admin/login` and `/api/admin/login`.
    - Without a valid session, page requests redirect to `/admin/login` and API requests get `401`.
  - The login route compares the password with a constant-time comparison (`crypto.timingSafeEqual` on equal-length SHA-256 digests).

- [ ] **Step 1: Write the failing tests:**
  - a signed token verifies before expiry
  - it fails after expiry
  - it fails with a different secret
  - it fails when tampered (one char changed)
  - `undefined` and `'garbage'` fail
- [ ] **Step 2:** Run `npm test`. Expected: FAIL. Implement `session.ts`, then run `npm test`. Expected: PASS.
- [ ] **Step 3:** Implement the middleware and the login and logout pages and routes.
- [ ] **Step 4:** Verify:
  - `curl -i localhost:3000/api/admin/submissions` returns 401
  - visiting `/admin` redirects to the login page
  - the wrong password shows an error
  - the right password lands on `/admin`
- [ ] **Step 5:** Commit with `feat(admin): session auth`.

### Task 11: Admin list, detail, approve/revise, WhatsApp, catalog

**Files:**
- Create:
  - `src/app/admin/page.tsx` (list)
  - `src/app/admin/[code]/page.tsx` (detail)
  - `src/components/admin/RevisionEditor.tsx`
  - `src/app/admin/katalog/page.tsx`
  - `src/app/api/admin/submissions/[code]/route.ts` (PATCH)
  - `src/app/api/admin/submissions/[code]/wa/route.ts` (POST, which marks `waSentAt` and returns `{ url }`)
  - `src/app/api/admin/catalog/route.ts` (PUT)

**Interfaces:**
- Consumes: `parseFinalLines`, `totalOf`, `buildWaMessage`, `waLink`, `DecorScene` (`readOnly`), and `PUBLIC_BASE_URL`.
- Produces:
  - `PATCH` body: either `{ action: 'approve' }` or `{ action: 'revise', lines: FinalLine[], adminNote: string }`.
    - `approve` sets `finalLinesJson` from the stored base plus the extra lines, sets `finalPrice = estimate`, and sets status `DISETUJUI`.
    - `revise` requires a non-empty `adminNote` and validates `lines` with `parseFinalLines`. It sets `finalPrice = totalOf(lines)` and status `DIREVISI`.
    - Re-revising is allowed.
  - `PUT /api/admin/catalog` takes `{ basePrice: number; items: { id: CatalogId; price: number; active: boolean }[] }`.
    - Prices must be integers ≥ 0, and ids must already exist.
  - List page:
    - columns: code, name, event date, estimate, final price, status badge
    - a filter tab per status
    - newest first
  - Detail page:
    - screenshot, a read-only 3D view of `designJson`, customer data, and the stored breakdown lines
    - an "Setujui" button
    - `RevisionEditor`, prefilled from the stored lines. Lines are editable label and amount. Admins can add a line and remove a line. A live total uses `formatIDR`, and a note field is required.
    - a "Kirim ke WA" button, enabled once the status is not `MENUNGGU`. It POSTs to `/wa` and opens the returned URL in a new tab.

- [ ] **Step 1:** Implement the API routes, then the pages.
- [ ] **Step 2:** Verify in the browser pane with the submission from Task 9:
  - the list shows it as Menunggu
  - "Setujui" sets the status to Disetujui with a final price equal to the estimate
  - a revision adding "Biaya luar kota 200000" with a note gives Direvisi and the final price +200000
  - "Kirim ke WA" opens a `https://wa.me/62…?text=` URL whose decoded text contains the code, the final price, the note, and `PUBLIC_BASE_URL/d/<code>?t=<token>`
  - changing the `panel` price to 450000 on the Katalog page makes a new submission use it, while the old submission's lines stay unchanged
- [ ] **Step 3:** Commit with `feat(admin): review, revise, whatsapp, catalog`.

### Task 12: Read-only design page

**Files:**
- Create: `src/app/d/[code]/page.tsx`, `src/components/configurator/ReadOnlyViewer.tsx`

**Interfaces:**
- Consumes: `Submission` via Prisma, `DecorScene` with `readOnly`, `formatIDR`.
- Produces:
  - `/d/[code]?t=<token>` renders when the code and token match. Otherwise it calls `notFound()`.
  - The page shows:
    - the desent-style header
    - the read-only 3D view (orbit only)
    - a status badge (Menunggu / Disetujui / Direvisi)
    - the breakdown: final lines and final price when present, otherwise the estimate labelled "Estimasi"
    - the admin note
  - It has `robots: { index: false }` metadata.

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** Verify:
  - the link from the Task 9 success screen renders the design and status
  - a wrong `t` returns 404
  - after the revision in Task 11, the page shows the revised price and note
- [ ] **Step 3:** Commit with `feat: read-only design page`.

### Task 13: Final verification

- [ ] **Step 1:** Run `npm test && node scripts/check-decoration.cjs && npm run build`. Expected: all pass.
- [ ] **Step 2:** Walk the full flow in the browser pane, at desktop and the `mobile` preset:
  - pick the Sweet 17 "Rose Gold Glam" preset
  - drag a jumbo balloon onto the stage
  - set panel to 2 and garland to 6 m
  - expected total: 2500000 + 400000 + 375000 + 75000 = `Rp3.350.000`
  - submit, then revise as admin, then click "Kirim ke WA"
  - open the read-only page
- [ ] **Step 3:** Check performance and accessibility:
  - with Chrome DevTools performance (or the `renderer.info` + fps readout in dev), the default preset holds ≥ 50 fps on desktop
  - with OS reduced motion on, there are no GSAP tweens (instant changes)
- [ ] **Step 4:** Record known limits in `README.md`:
  - SQLite plus a local `uploads/` folder do not survive serverless hosting
  - to deploy on Vercel, switch Prisma to Postgres and move screenshots to object storage
- [ ] **Step 5:** Commit with `docs: readme and known limits`.
