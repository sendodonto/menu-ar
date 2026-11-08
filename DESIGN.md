---
name: Casa Nostra · MENU AR
description: A calm, food-first restaurant menu that reads like a native Apple app, with dishes in 3D and on the guest's own table.
colors:
  clay: "#b4532f"
  clay-ink: "#8e3d1f"
  clay-soft: "#f6e8e1"
  ramina: "#5e6b2e"
  ramina-soft: "#ecefdf"
  glaze: "#f8f7f4"
  glaze-2: "#efece6"
  tile: "#ffffff"
  grout: "#e7e2da"
  grout-2: "#d6cfc4"
  ink: "#1c1a17"
  ink-2: "#5a534c"
  ink-3: "#6f675f"
  danger: "#a3271b"
typography:
  display:
    fontFamily: "Bodoni Moda, 'Bodoni 72', Didot, serif"
    fontSize: "40px (60px at sm+)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Bodoni Moda, 'Bodoni 72', Didot, serif"
    fontSize: "36px (48px at sm+)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Bodoni Moda, 'Bodoni 72', Didot, serif"
    fontSize: "26px (30px at sm+)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.015em"
  subhead:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.375
    fontFeature: "'ss01'"
  item:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.375
  label:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  tile: "12px"
  group: "16px"
  sheet: "28px"
  full: "9999px"
spacing:
  gutter: "16px"
  gutter-sm: "24px"
  row: "16px"
  section: "36px"
  section-sm: "48px"
components:
  button-primary:
    backgroundColor: "{colors.clay}"
    textColor: "{colors.tile}"
    rounded: "{rounded.tile}"
    height: "52px"
    padding: "0 20px"
  button-primary-hover:
    backgroundColor: "{colors.clay-ink}"
  button-secondary:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    height: "44px"
    padding: "0 16px"
  button-ghost:
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    height: "44px"
    padding: "0 16px"
  button-icon:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: "40px"
  input:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "10px 14px"
  grouped-list:
    backgroundColor: "{colors.tile}"
    rounded: "{rounded.tile}"
    padding: "16px"
  order-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.tile}"
    rounded: "{rounded.group}"
    height: "56px"
    padding: "0 16px"
  badge-3d:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "3px 8px"
  badge-count:
    backgroundColor: "{colors.clay}"
    textColor: "{colors.tile}"
    rounded: "{rounded.full}"
    height: "18px"
---

# Design System: Casa Nostra · MENU AR

## Overview

**Creative North Star: "The Quiet Native App"**

The menu behaves like a first-party iOS app that happens to belong to a restaurant: one clear scrolling list, photographs leading, one primary action per screen. A warm off-white ground carries white grouped surfaces with soft shadow and hairline dividers; translucent blurred chrome (header, category tabs, bottom action bar) lets content scroll beneath it. Bodoni Moda gives page and section titles a restaurant's voice; everything functional is Schibsted Grotesk.

Density is relaxed but not sparse: 16px gutters, 16px row padding, generous section breaks. Color is almost absent; ink on off-white does the work, terracotta is a rare signal, olive confirms. The camera view is the one dark place: dark glass controls float over the live camera feed so the dish on the guest's table stays the subject.

Confirmed rejections: the previous "Maiolica" tile-floor world (rejected by the user as ugly and confusing), busy grids of icon buttons, decorative tile ornament, emoji, gradients, over-rounded cards.

**Key Characteristics:**
- Off-white ground, white grouped lists, hairline dividers, soft ambient shadows.
- Translucent blurred chrome over scrolling content.
- Serif for titles only; grotesk for every control, price and label.
- Terracotta is scarce and semantic; olive means "done".
- Dark glass only over the camera feed.

## Colors

A near-neutral warm palette where ink carries hierarchy and one terracotta accent marks the action.

### Primary
- **Terracotta Clay** (clay): fill of the primary CTA (Adicionar, Enviar pedido), the active category tab underline, the cart count badge, and the global focus ring, caret and accent-color.
- **Burnt Clay Ink** (clay-ink): primary hover, text-link actions such as "Cancelar" in search, and selection text.
- **Clay Blush** (clay-soft): text selection background; admin active nav row.

### Secondary
- **Ramina Olive** (ramina): confirmations only: the order-sent check disc, admin "Entregue" status, admin switches on.
- **Olive Mist** (ramina-soft): soft olive surface for confirmation contexts.

### Neutral
- **Warm Off-White** (glaze): page ground, the material chrome tint, theme-color.
- **Linen** (glaze-2): secondary fills: icon discs, the 3D stage, skeletons, ghost hover.
- **Plate White** (tile): grouped lists, cards, secondary buttons, inputs, round add buttons.
- **Hairline** (grout): dividers inside grouped lists and input borders.
- **Hairline Strong** (grout-2): input hover border, scrollbar thumb.
- **Soft Black** (ink): text, the floating order bar, toasts, the AR icon disc.
- **Graphite** (ink-2): descriptions and secondary text.
- **Stone** (ink-3): hints, placeholders, chevrons, photo credits.
- **Brick Red** (danger): errors and destructive actions only.

### Named Rules
**The One Terracotta Rule.** Terracotta appears only on the primary CTA, the active tab line, the cart count badge and the focus ring. If a second terracotta element shows on the same screen and it is not one of those, it is wrong.

**The Olive Means Done Rule.** Olive is never decoration; it marks a completed state.

## Typography

**Display Font:** Bodoni Moda (with 'Bodoni 72', Didot, serif), optical sizing on
**Body Font:** Schibsted Grotesk (with ui-sans-serif, system-ui), stylistic set ss01 on

**Character:** A high-contrast Didone gives the restaurant its voice at title sizes; a sturdy contemporary grotesk keeps every control, price and list item legible like system UI.

### Hierarchy
- **Display** (400, 40px / 60px at sm+, 1.02): the page title ("Cardápio").
- **Headline** (400, 36px / 48px at sm+, 1.05): the dish name on its own page; 34px in the desktop AR handoff.
- **Title** (400, 26px / 30px at sm+, 1): section titles ("Destaques do chef", category names), dialog titles.
- **Subhead** (sans 600, 17px): in-page headings on detail and cart screens (Ingredientes, Alérgenos, Resumo).
- **Item** (sans 600, 16px): dish names in lists and cards, button labels at lg.
- **Body** (400, 15px, 1.375): descriptions (14px, two-line clamp in rows), prices (15px medium, lining numerals), long text at 16px relaxed capped near 58ch.
- **Label** (500, 11–12px): fact labels, the 3D badge, camera control captions. Sentence case, no tracking.

### Named Rules
**The Serif Stops at Titles Rule.** Bodoni sets page, section and dish-page titles only. Any heading inside a functional block switches to the sans at 17px semibold.

**The Lining Price Rule.** Every price and count uses lining numerals (`.tnum`).

## Layout

Single centered column, max 768px (48rem) for the menu, 1024px (64rem) for dish detail, which splits into two columns at sm+ with the photo sticky on the left. Gutters 16px, 24px at sm+. Sections are spaced 36px apart (48px at sm+); titles sit 12px above their group.

The first viewport stacks: translucent header (56px), page title and restaurant line, a one-line 3D explainer, the chef-highlights carousel (72% width, 4:5 cards, snap scrolling, edge-aligned to the column), then sticky translucent category tabs (48px) pinned under the header with scroll-spy.

Bottom-anchored actions respect the safe area (`max(env(safe-area-inset-bottom), 12–14px)`); content reserves room under them. Every tap target is at least 40px, most 44px.

## Elevation & Depth

Hybrid: tonal layering (white on off-white) plus soft, ambient shadows, plus translucent material for chrome. Shadows are never hard or offset.

### Shadow Vocabulary
- **Card** (`0 1px 2px rgb(28 26 23 / 0.04), 0 2px 10px -4px rgb(28 26 23 / 0.08)`): grouped lists, fact strips, the quantity stepper, summary cards.
- **Lift** (`0 1px 2px rgb(28 26 23 / 0.05), 0 8px 24px -12px rgb(28 26 23 / 0.22)`): floating controls: the round add button, the order bar, toasts, desktop dialogs.
- **Sheet** (`0 -1px 0 rgb(28 26 23 / 0.05), 0 -16px 40px -24px rgb(28 26 23 / 0.35)`): upward shadow for bottom sheets.

### Materials
- **Light material**: off-white at 78% with 20px blur and 180% saturation, separated from content by a 6% black hairline. Header, category tabs, dish bottom bar, photo back button.
- **Dark glass**: black at 45% with extra-large blur and 150% saturation, white text. Used only over the live camera feed. Under reduced transparency it falls back to opaque ink at 92%; light material falls back to solid off-white.

### Named Rules
**The Chrome Is Glass Rule.** Persistent chrome is translucent and content scrolls under it; content surfaces are opaque.

**The Dark Only Over Camera Rule.** Dark glass exists because the camera feed is unpredictable; it never appears on light screens.

## Shapes

Gently curved, never pillowy. Images, list groups, inputs and standard buttons use 12px; larger grouped cards on detail and cart, the order bar and camera controls use 16px; the 3D dialog and desktop model stage use 28px as a sheet. Every icon-only control, stepper, badge, toast and search field is fully round. Dividers are 1px hairlines inset inside groups; groups clip their rows.

## Components

### Buttons
Quiet and system-like; the press is the feedback.
- **Shape:** gently curved (12px); icon buttons fully round.
- **Primary:** terracotta fill, white label, 52px tall at lg with 16px semibold label; 44px at md. One per screen.
- **Hover / Focus / Press:** hover deepens to clay-ink; every pressable scales to 0.97 on press over 160ms with an expo-out curve; focus shows a 2px terracotta outline offset 2px.
- **Secondary:** white with a hairline border, ink label, hover to off-white.
- **Ghost:** no fill, ink label, hover to linen.
- **Danger:** white with hairline border, brick-red label.
- **Round add:** 40px white disc with Lift shadow, plus icon, pinned to the bottom-right of a dish row's photo.

### Chips
- **3D badge:** small white pill (11px semibold) with a cube icon; on list rows it sits flat on linen without shadow.

### Cards / Containers
- **Corner Style:** 12px for list groups, 16px for detail and cart groups.
- **Background:** plate white on the off-white ground.
- **Shadow Strategy:** Card shadow at rest; Lift only for floating elements.
- **Border:** none outside; hairline dividers between rows.
- **Internal Padding:** 16px (20px at sm+).

### Inputs / Fields
- **Style:** white, 1px hairline border, 12px radius, 16px text, label above at 14px medium.
- **Focus:** border turns terracotta with a 2px terracotta ring at 20% opacity.
- **Error:** brick-red border and message below; hints in stone.
- **Search:** fully round linen-tinted field (5% black) inside the tab bar, expands in place with a "Cancelar" text action.

### Navigation
- **Header:** light material, wordmark left, bag icon right with a terracotta count badge that bumps on change.
- **Category tabs:** light material, 15px labels; inactive graphite, active ink semibold with a 2px terracotta underline; the rail fades at its right edge and auto-centers the active tab.

### Dish Row (signature)
Text left (name, two-line description, price, optional 3D badge), 104px square photo right, the whole row opens the dish; a separate round add button floats on the photo corner.

### Order Bar
Floating soft-black bar (56px, 16px radius, Lift shadow) once the order has items: count pill, "Ver pedido", total.

### Camera View (signature)
Full-bleed camera feed with dark glass panels: dish name and price top-left, round close top-right, status pill, and a bottom row of two 56px glass tool buttons (Trazer, Ocultar) beside a solid white "Adicionar · price" button. On desktop the view becomes an off-white handoff with the 3D stage and a QR code.

### Toast
Fully round soft-black pill with Lift shadow, olive-tinted check or clay-tinted alert icon, above the order bar.

## Do's and Don'ts

### Do:
- **Do** keep one terracotta primary action per screen, plus only the active tab line, cart count badge and focus ring.
- **Do** put dishes in white grouped lists with hairline dividers and the Card shadow.
- **Do** make persistent chrome light material (78% off-white, 20px blur) with a hairline edge.
- **Do** set titles in Bodoni Moda and every functional label, price and heading-in-a-block in Schibsted Grotesk.
- **Do** give every pressable the 0.97 press scale and a 40–44px minimum target.
- **Do** use dark glass only over the camera feed, with an opaque fallback under reduced transparency.

### Don't:
- **Don't** bring back majolica tiles, tile borders or painted ornament.
- **Don't** build grids of icon buttons; one list, one action.
- **Don't** use emoji, gradients or hard offset shadows.
- **Don't** round cards beyond 16px; 28px is for sheets only.
- **Don't** use terracotta for icons, decoration or any badge other than the cart count.
- **Don't** use olive except to confirm a completed state.
