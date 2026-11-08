---
name: Casa Nostra · MENU AR
description: A restaurant menu laid as a floor of tin-glazed majolica tiles, with dishes in 3D and on the guest's table.
colors:
  glaze: "#f8f7f4"
  glaze-2: "#f1ede6"
  tile: "#fdfcfa"
  grout: "#e4ded3"
  grout-2: "#d3cbbd"
  clay: "#b4532f"
  clay-ink: "#8e3d1f"
  clay-soft: "#f3e3da"
  ramina: "#5e6b2e"
  ramina-soft: "#e8ead9"
  ink: "#2a2420"
  ink-2: "#5b524b"
  ink-3: "#6f665e"
  danger: "#a3271b"
typography:
  display:
    fontFamily: "Bodoni Moda, 'Bodoni 72', Didot, serif"
    fontSize: "34px / 3rem at sm+"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Bodoni Moda, 'Bodoni 72', Didot, serif"
    fontSize: "30px / 2.25rem at sm+"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Bodoni Moda, 'Bodoni 72', Didot, serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
    fontFeature: "'ss01'"
  label:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.35
    fontFeature: "'ss01', 'lnum'"
rounded:
  tile: "3px"
  chip: "2px"
spacing:
  grout: "1px"
  tile-pad: "12px"
  tile-pad-sm: "16px"
  gutter: "16px"
  gutter-sm: "24px"
  section: "40px"
  section-sm: "56px"
components:
  button-primary:
    backgroundColor: "{colors.clay}"
    textColor: "{colors.glaze}"
    rounded: "{rounded.tile}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.clay-ink}"
  button-secondary:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "0 16px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.glaze-2}"
  button-ghost:
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "0 16px"
    height: "44px"
  button-danger:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.danger}"
    rounded: "{rounded.tile}"
    padding: "0 16px"
    height: "44px"
  input:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "10px 14px"
  chip-category:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "0 14px"
    height: "40px"
  chip-category-active:
    backgroundColor: "{colors.clay}"
    textColor: "{colors.glaze}"
  price-chip:
    backgroundColor: "{colors.clay-soft}"
    textColor: "{colors.clay-ink}"
    rounded: "{rounded.chip}"
    padding: "2px 6px"
  dish-tile:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.ink}"
    padding: "12px"
  cart-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.glaze}"
    rounded: "{rounded.tile}"
    padding: "0 16px"
    height: "56px"
---

# Design System: Casa Nostra · MENU AR

## Overview

**Creative North Star: "The Maiolica Floor"**

The menu is a floor of tin-glazed majolica tiles. Every dish is a square tile set into a fine grout grid on a glaze-white ground; the clay body shows at the tile's bottom edge, in price chips and in the active state; ramina green marks things that are done or available; text is soft manganese ink. The grid is the real CSS armature, not decoration: tiles butt against each other with a 1px grout gap, so the page reads as one laid surface rather than cards floating over a page.

Density is Operate: the guest goes menu, dish, 3D, table, order on their own phone; the owner runs orders and the menu on desktop in the same world, with the same tiles, grout and clay, only tighter. Shapes are fired tile (3px corners), never pills. Motion has one grammar: a tile settling into its bed (short rise plus slight scale, out-expo easing, about 360ms, staggered 45ms per tile).

The only hand-painted element is the restaurant mark: one majolica tile (clay border, four ramina leaves, terracotta flower). It is the brand, used wherever the brand is named (header, footer, admin sidebar), never as an ornament elsewhere.

**Key Characteristics:**
- Glaze-white ground, white tile faces, 1px warm grout hairlines forming a visible grid.
- Terracotta clay as the single action and price color; ramina green only for confirmations and availability.
- Bodoni Moda serif for names and headings, Schibsted Grotesk for everything functional.
- 3px corners everywhere a surface has corners; full rounding only for tiny indicators.
- Flat at rest; soft warm shadows only on things that float above the floor (cart bar, toasts, dialogs, AR overlay controls).
- Lining figures on every price, minute count and real-size dimension.

## Colors

A warm, low-chroma ceramic palette: off-white glazes, warm grout greys, one fired terracotta and one olive green, with soft-black ink.

### Primary
- **Fired Terracotta** (clay): primary buttons, active category chip, cart count badge, focus ring, caret, accent-color, icon tint on 3D and real-size markers, and the 2px inset bottom edge of every dish tile.
- **Deep Clay Ink** (clay-ink): text-weight terracotta. Prices, primary hover, link hover on dish names, selection text.
- **Clay Wash** (clay-soft): the price chip ground, text selection, the active admin nav item.

### Secondary
- **Ramina Olive** (ramina): confirmation and availability only: order-sent check tile, "Entregue" status, switch on-state.
- **Ramina Wash** (ramina-soft): soft ground for availability states.

### Neutral
- **Glaze White** (glaze): page ground, sticky header and rail, sheets and dialog surfaces. Pinned by the brief.
- **Second Glaze** (glaze-2): hover fill for secondary and ghost controls, skeleton base, footer band, 3D stage falloff.
- **Tile Face** (tile): the face of every tile, input, chip and secondary button; one step brighter than the ground.
- **Grout** (grout): every 1px hairline: grid gaps, borders, dividers.
- **Dark Grout** (grout-2): hover border, scrollbar thumb, switch off-state.
- **Manganese Ink** (ink): body and heading text; the cart bar and toast ground.
- **Ink 2 / Ink 3** (ink-2, ink-3): descriptions, then meta (minutes, counts, hints, placeholders). Under `prefers-contrast: more` both darken and grout deepens.
- **Kiln Red** (danger): destructive buttons, field errors, cancelled status. Never decorative.

### Named Rules
**The One Clay Rule.** Terracotta is the only action color. If something is clickable and primary, it is clay; if something is clay, it is either an action, a price, the active state, or a tile's fired edge.

**The Ramina Means Done Rule.** Green appears only when something succeeded or is available. Never as a second accent for decoration.

**The Ground and Face Rule.** Ground is glaze, surfaces are tile, separations are grout. Do not introduce a fourth neutral surface.

## Typography

**Display Font:** Bodoni Moda (optical sizing on, fallbacks Bodoni 72, Didot, serif)
**Body Font:** Schibsted Grotesk (with ui-sans-serif, system-ui), stylistic set `ss01`

**Character:** A high-contrast Didone gives the dish names the voice of a printed Italian menu; a sturdy grotesk keeps prices, buttons and admin tables plain and legible.

### Hierarchy
- **Display** (400, 34px mobile / 3rem desktop, 1.02): the house dish name in the first viewport; admin page titles.
- **Headline** (400, 30px / 2.25rem, 1): category section headings, admin board column and section headings at smaller sizes.
- **Title** (400, 18px, 1.15): dish names on tiles.
- **Body** (400, 15px, 1.625): descriptions, inputs, button labels; descriptions held to about 48ch.
- **Label** (500, 13px): meta (minutes, counts, hints, real-size chip). Badge text drops to 11px semibold. Prices are 14px semibold in the chip, 20px semibold in the feature.

All serif headings get `text-wrap: balance` and -0.01em tracking.

### Named Rules
**The Serif Names Things Rule.** Serif is for names: the restaurant, dishes, categories, page titles. Prices, buttons, labels and data are always sans.

**The Lining Figures Rule.** Every number a guest compares (price, minutes, Ø cm, counts) uses lining numerals.

## Layout

A single centered column capped at 72rem (max-w-6xl) with 16px gutters on mobile, 24px from `sm` (640px). The sticky header is 64px plus safe-area inset; the sticky category rail beneath it is 56px; scroll padding is 8.5rem so anchored sections clear both.

The dish grid is a true CSS grid with a 1px gap whose background is grout: 2 columns on mobile (edge to edge, no gutter), 3 at `md` (768px), 4 at `lg` (1024px). From `sm` the grid is inset by the gutter and clipped to a 3px tile corner. Tile interiors pad 12px, 16px from `sm`. Sections are separated by 40px (56px from `sm`) with a serif heading left and a lining-figure count right.

The first viewport is one wide tile: photo then text stacked on mobile; at `sm` a two-column split (1.15fr photo, 1fr text, min 420px tall) inside a single grout-bordered tile. Fixed bottom bars (cart bar, dish action bar) respect the bottom safe area with a 12px minimum.

Admin uses a left sidebar (glaze, grout right border) and the same tile/grout vocabulary for boards and tables.

## Elevation & Depth

Flat by default: depth is conveyed by the glaze/tile/grout layering and hairlines. Shadows are soft, warm (tinted from ink, never pure black), and reserved for things that float above the floor.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 1px 2px rgb(42 36 32 / 0.06), 0 10px 28px -14px rgb(42 36 32 / 0.28)`): the cart bar, toasts, the 3D dialog on desktop, overlay buttons on photos and in AR, featured-strip hover.
- **Sheet** (`box-shadow: 0 -1px 0 rgb(42 36 32 / 0.06), 0 -18px 40px -24px rgb(42 36 32 / 0.35)`): bottom-anchored action bars (dish detail, AR controls).
- **Grout ring + fired edge** (`box-shadow: 0 0 0 1px var(--color-grout), inset 0 -2px 0 var(--color-clay)`): the dish tile; not elevation, it draws the grout around the tile and the clay body at its foot.
- **Backdrop** (`rgb(42 36 32 / 0.45)`, 2px blur): behind open dialogs.

### Named Rules
**The Floor Stays Flat Rule.** Nothing laid in the grid casts a shadow at rest. Only floating layers (bars, toasts, dialogs, overlay controls) get Lift or Sheet.

## Shapes

Fired-tile corners (3px) on every surface: buttons, inputs, chips, tiles, the house feature, dialogs, the cart bar. Price chips use a slightly tighter 2px. Full rounding is limited to tiny indicators: the cart count bubble, the admin switch track and knob, and progress bars. Borders are always 1px grout (darkening to grout-2 on hover). Dish imagery is cropped square on tiles and 16:11 in the mobile feature.

## Components

### Buttons
Tactile and pressed-in: every press settles like a tile pushed into its bed (scale 0.97, 160ms out-expo).
- **Shape:** fired-tile corners (3px). Heights 36 / 44 / 48px (sm / md / lg), 500 weight, 14 / 15 / 16px.
- **Primary:** clay on glaze text with a faint inset bottom shade; hover deepens to clay-ink.
- **Secondary:** tile face, ink text, 1px grout border; hover darkens border to grout-2 and fills glaze-2.
- **Ghost:** ink text, no border; hover fills glaze-2.
- **Danger:** tile face, kiln-red text, grout border; hover tints the border red at 40%.
- **Focus:** 2px clay outline, 2px offset (global). Disabled at 45% opacity.

### Chips
- **Category chip:** 40px tall, tile face, grout border, 14px medium; active is solid clay with glaze text. Lives in the sticky rail with a square search chip that expands into a full-width search field.
- **Price chip:** clay-soft ground, clay-ink 14px semibold lining figures, 2px corners.
- **Real-size chip:** tile face, grout border, ruler icon in clay, "Tamanho real · Ø 34 cm".
- **3D badge:** small tile-face tab over the photo's top-left, cube icon in clay, 11px semibold.

### Cards / Containers
- **Dish tile:** tile face, square photo, serif title, price chip plus minutes, then actions (3D, AR, add). Grout ring plus a 2px clay foot. Enters with tile-set stagger.
- **House feature:** one large tile; photo plus serif display name, description, price, real-size chip and the two actions "Ver em 3D" (secondary) and "Na minha mesa" (primary).
- **Admin order card:** tile face, grout border, 3px corners, grout divider between header and lines; empty columns show a dashed grout cell.

### Inputs / Fields
- **Style:** tile face, 1px grout border, 3px corners, 10px 14px padding, 15px text, ink-3 placeholder; hover border grout-2.
- **Focus:** border turns clay with a 2px clay ring at 20%.
- **Error:** border and message in kiln red; label 14px medium above, hint 14px ink-3 below.

### Navigation
- **Guest header:** sticky glaze bar, grout bottom border, mark left, 44px cart tile right with a clay count bubble that bumps on change.
- **Category rail:** sticky under the header, horizontally scrolling chips with scroll-spy that centers the active chip.
- **Admin sidebar:** mark at top, icon plus label items; active item is clay-soft ground with clay-ink text.

### Cart Bar (signature)
A fixed bottom bar in manganese ink with Lift: clay count tile, "Ver pedido", total in lining figures, arrow. Appears with tile-set once the order has an item.

### 3D Viewer
A full-screen sheet on mobile, a 3px-cornered Lift dialog on desktop; enters and leaves along the same path (24px rise, 360ms out-expo). Model controls appear only for dishes that have a model.

## Do's and Don'ts

### Do:
- **Do** lay dishes in a CSS grid with a 1px grout gap; tiles touch, the grout shows.
- **Do** use 3px corners on every surface with corners.
- **Do** keep terracotta for actions, prices, the active state and the tile's fired edge.
- **Do** use lining figures for prices, minutes and dimensions.
- **Do** animate entries with the settle grammar (rise plus slight scale, out-expo, about 360ms, 45ms stagger) and honor reduced motion.
- **Do** show 3D and AR controls only where a model exists, and label demo models as demonstrative.

### Don't:
- **Don't** float rounded cards over the page or round surfaces into pills.
- **Don't** shadow anything laid in the grid; Lift and Sheet are for floating layers only.
- **Don't** use ramina green as decoration; it means done or available.
- **Don't** use emoji or decorative gradients on surfaces.
- **Don't** repeat the hand-painted tile motif as ornament; it is the restaurant mark only.
- **Don't** set prices, buttons or data in the serif.
