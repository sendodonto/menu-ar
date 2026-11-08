# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Pinned by the brief: Next.js (App Router, static export), TypeScript, Tailwind CSS, Google Model Viewer, Supabase, Lucide icons. Deploy preview on GitHub Pages (static). Supabase runs in "demo mode" (browser storage) until `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set; schema SQL ships in `supabase/`.

## Users

- Restaurant guest at the table, on their own phone (opened via QR code), deciding what to order. Mobile first, one hand, often dim restaurant light.
- Restaurant owner / manager (admin) maintaining dishes, prices, photos, 3D models and following orders, usually on desktop or tablet.
- Primary buyer of this version: restaurant owners shown the demo by Erick (prototype-first sales). Casa Nostra is the showcase; MENU AR stays a discreet product mark.

## Product Purpose

A digital menu where the guest sees a dish in 3D and places it at real scale on their own table through AR before ordering, then orders from the phone. Success: a guest goes from menu → dish → "na minha mesa" → order without help, and an owner can manage the menu without a developer.

## Positioning

Real spatial AR at true physical scale (WebXR / Scene Viewer / Quick Look) from the browser, no app install, on the restaurant's own branded menu.

## Operating Context

QR code on the table; restaurant lighting; guest phone (Android Chrome with ARCore, iPhone Safari with Quick Look, or devices without AR which get the 3D viewer and a clear notice). Admin uses a separate authenticated area.

## Capabilities and Constraints

- Menu with categories: Entradas, Massas, Pizzas, Pratos principais, Sobremesas, Bebidas; ≥15 dishes with description, BRL price, prep time, ingredients, allergens, serves, photo, optional GLB model with physical dimensions.
- 3D viewer (rotate, zoom, pan, progress), AR placement with remove + back controls, cart with notes, simulated checkout (no payments).
- Admin: auth, orders, dish CRUD, prices, categories, photo + GLB upload, activate/deactivate, basic stats.
- Never fake 3D with a flat photo, never fake AR with a camera feed; dishes without a model show no 3D/AR button.

## Brand Commitments

- Product name MENU AR. Demo restaurant CASA NOSTRA (fictional), contemporary Italian.
- Brief pins: off-white ground #F8F7F4, soft black text, olive or terracotta in small details, serif titles + modern sans text, discreet borders, soft shadows, generous whitespace. References: Apple, Linear, Aesop, high-end contemporary restaurants. No emoji icons, no exaggerated gradients, no over-rounded cards, no generic dashboard look.

## Evidence on Hand

- 3D: Poly Haven CC0 scans (strawberry_chocolate_cake, carrot_cake, croissant, wine_bottles_01) plus dishes modeled in Blender; procedural ones are labeled as demonstrative models.
- Photos: stock photography (Unsplash license), labeled illustrative.
- No real restaurant, reviews, ratings or sales numbers exist; never invent them. Popularity badges are the restaurant's own picks ("destaque da casa"), not fake metrics.

## Product Principles

1. Truthful tech: every 3D/AR affordance is real or absent.
2. Food first: photography and the dish lead; chrome recedes.
3. One-hand mobile flow from menu to order.
4. Owner autonomy: everything shown is editable in admin.

## Accessibility & Inclusion

WCAG AA contrast, 44px touch targets, keyboard-operable admin, prefers-reduced-motion respected, allergen info always in text.
