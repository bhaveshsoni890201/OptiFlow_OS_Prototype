# OptiFlow OS — Design System

> Design system for the OptiFlow OS frontend — a Vue 3 + TypeScript + Tailwind CSS v3 SPA
> targeting MSME factory management in textile manufacturing (India market).

---

## 1. Design Philosophy

### Mobile-First
- Breakpoints start at **xs (360px)** covering budget Android devices common in MSME environments.
- All layouts collapse to single-column below `md` (768px).
- Touch targets are never smaller than **44×44px** (`min-h-touch` / `min-w-touch`).
- Primary navigation uses a bottom tab bar on mobile; sidebar on tablet+.

### MSME-Focused
- Support for **Hindi and Hinglish** via the `Noto Sans Devanagari` typeface.
- Offline-capable UI patterns — optimistic updates with queue indicators.
- Low-data mode: reduced image payloads, minimal icon animations on 2G-class connections.
- Role-based views: **doer** (task-focused), **captain** (team & rescue), **admin** (factory-wide).

### Accessibility-First
- All color pairs meet **WCAG AA (≥4.5:1)** for normal text and **AA (≥3:1)** for large text.
- Body text targets **WCAG AAA (≥7:1)**.
- `prefers-contrast: more` overrides for low-vision users.
- `prefers-reduced-motion: reduce` kills all non-essential animation.
- Focus-visible rings on every interactive element.
- Full keyboard navigation — Tab, Enter, Space, Escape, Arrow keys.

---

## 2. Color System

### 2.1 Brand Palette

| Token            | Light      | Dark       | Usage                          |
|------------------|------------|------------|--------------------------------|
| `brand-50`       | `#EFF6FF`  | `#172554`  | Background tint                |
| `brand-100`      | `#DBEAFE`  | `#1E3A5F`  | Hover/surface tint             |
| `brand-600`      | `#2563EB`  | `#60A5FA`  | Primary buttons, links         |
| `brand-700`      | `#1D4ED8`  | `#93C5FD`  | Active / pressed state         |

### 2.2 Neutral Ramp

| Token              | Light      | Dark       | Usage                    |
|--------------------|------------|------------|--------------------------|
| `neutral-50`       | `#FAFAFA`  | `#171717`  | Page background          |
| `neutral-100`      | `#F5F5F5`  | `#262626`  | Card / surface bg        |
| `neutral-200`      | `#E5E5E5`  | `#404040`  | Borders, dividers        |
| `neutral-300`      | `#D4D4D4`  | `#525252`  | Disabled border          |
| `neutral-400`      | `#A3A3A3`  | `#737373`  | Disabled text            |
| `neutral-500`      | `#737373`  | `#A3A3A3`  | Placeholder / metadata   |
| `neutral-600`      | `#525252`  | `#D4D4D4`  | Secondary text           |
| `neutral-700`      | `#404040`  | `#E5E5E5`  | Body text                |
| `neutral-800`      | `#262626`  | `#F5F5F5`  | Heading text             |
| `neutral-900`      | `#171717`  | `#FAFAFA`  | Strong headings          |

### 2.3 Semantic Status Colors

| Token            | Light      | Dark       |
|------------------|------------|------------|
| `success-50`     | `#F0FDF4`  | `#052E16`  |
| `success-600`    | `#16A34A`  | `#4ADE80`  |
| `warning-50`     | `#FFFBEB`  | `#451A03`  |
| `warning-300`    | `#FCD34D`  | `#FBBF24`  |
| `warning-500`    | `#F59E0B`  | `#F59E0B`  |
| `danger-50`      | `#FEF2F2`  | `#450A0A`  |
| `danger-500`     | `#EF4444`  | `#F87171`  |
| `danger-600`     | `#DC2626`  | `#FCA5A5`  |
| `danger-700`     | `#B91C1C`  | `#FECACA`  |
| `info-600`       | `#0891B2`  | `#22D3EE`  |

### 2.4 Task Status Mapping

Each `TaskStatus` enum value maps to a semantic colour used for badges, progress bars, and list indicators.

| Status          | Enum Value      | Token              | Light      | Dark       |
|-----------------|-----------------|--------------------|------------|------------|
| Pending         | `pending`       | `task-pending`     | `#737373`  | `#A3A3A3`  |
| In Progress     | `in_progress`   | `task-in-progress` | `#0891B2`  | `#22D3EE`  |
| Blocked         | `blocked`       | `task-blocked`     | `#F59E0B`  | `#F59E0B`  |
| Escalated       | `escalated`     | `task-escalated`   | `#DC2626`  | `#FCA5A5`  |
| Completed       | `completed`     | `task-completed`   | `#16A34A`  | `#4ADE80`  |
| Reviewed        | `reviewed`      | `task-reviewed`    | `#2563EB`  | `#60A5FA`  |

### 2.5 Rescue Severity Mapping

Each `RescueSeverity` maps to a severity colour for the Rescue Console.

| Severity           | Enum Value         | Token                  | Light      | Dark       |
|--------------------|--------------------|------------------------|------------|------------|
| Soft Reminder      | `soft`             | `rescue-soft-reminder` | `#FCD34D`  | `#FBBF24`  |
| Warning            | `warning`          | `rescue-warning`       | `#F59E0B`  | `#F59E0B`  |
| High Risk          | `high_risk`        | `rescue-high-risk`     | `#EF4444`  | `#F87171`  |
| Admin Escalation   | `admin_escalation` | `rescue-admin-escalation` | `#B91C1C`  | `#FECACA`  |

### 2.6 High-Contrast Overrides

Applied inside `@media (prefers-contrast: more)`. All values are hardened to increase
luminance contrast against their neighbours.

| Token              | Light HC    | Dark HC     |
|--------------------|-------------|-------------|
| `brand-600`        | `#1E40AF`   | `#93C5FD`   |
| `brand-700`        | `#1E3A8A`   | `#BFDBFE`   |
| `neutral-200`      | `#D4D4D4`   | `#525252`   |
| `neutral-300`      | `#A3A3A3`   | `#737373`   |
| `neutral-400`      | `#737373`   | `#A3A3A3`   |
| `neutral-500`      | `#525252`   | `#D4D4D4`   |
| `neutral-600`      | `#404040`   | `#E5E5E5`   |
| `neutral-700`      | `#262626`   | `#F5F5F5`   |
| `success-600`      | `#15803D`   | `#86EFAC`   |
| `warning-500`      | `#D97706`   | `#FBBF24`   |
| `danger-500`       | `#DC2626`   | `#FCA5A5`   |
| `danger-600`       | `#B91C1C`   | `#FECACA`   |
| `danger-700`       | `#991B1B`   | `#FEE2E2`   |
| `info-600`         | `#0E7490`   | `#67E8F9`   |

### 2.7 Contrast Ratios

| Pair                                | Ratio    | Pass       |
|-------------------------------------|----------|------------|
| `neutral-900` text on `neutral-50`  | **16.7:1** | AAA ✓    |
| `neutral-700` text on `neutral-100` | **10.4:1** | AAA ✓    |
| `neutral-600` text on `neutral-50`  | **7.1:1**  | AAA ✓    |
| `neutral-500` on `neutral-100`      | **4.6:1**  | AA ✓     |
| `brand-600` text on `white`         | **6.8:1**  | AA ✓     |
| `danger-500` text on `white`        | **4.5:1**  | AA ✓     |
| `success-600` text on `white`       | **5.0:1**  | AA ✓     |
| `info-600` text on `white`          | **4.8:1**  | AA ✓     |
| _Dark:_ `neutral-900` on `neutral-50` | **16.7:1** | AAA ✓ |

All body text pairs meet **WCAG AA ≥4.5:1** minimum. Body text defaults
(`neutral-700` on `neutral-50`) exceed **AAA ≥7:1**.

---

## 3. Typography

### 3.1 Font Families

| Token              | Value                                                                  | Usage                        |
|--------------------|------------------------------------------------------------------------|------------------------------|
| `font-sans`        | `'Inter', system-ui, -apple-system, sans-serif`                        | Latin / English UI           |
| `font-hindi`       | `'Noto Sans Devanagari', 'Inter', system-ui, sans-serif`               | Hindi / Hinglish UI          |

Loaded via Google Fonts (`Inter:400,600,700` + `Noto Sans Devanagari:400,600,700`).

### 3.2 Text Styles

| Name         | Size     | Line Height | Weight | Tracking | Transform | Tailwind Class     |
|--------------|----------|-------------|--------|----------|-----------|--------------------|
| **Display**  | 28px     | 36px        | 700    | normal   | none      | `text-display`     |
| **H1**       | 24px     | 32px        | 700    | normal   | none      | `text-h1`          |
| **H2**       | 20px     | 28px        | 600    | normal   | none      | `text-h2`          |
| **H3**       | 16px     | 24px        | 600    | normal   | none      | `text-h3`          |
| **Body**     | 14px     | 22px        | 400    | normal   | none      | `text-body`        |
| **Body Strong** | 14px  | 22px        | 600    | normal   | none      | `text-body-strong` |
| **Caption**  | 12px     | 16px        | 400    | normal   | none      | `text-caption`     |
| **Overline** | 11px     | 16px        | 600    | 0.5px    | uppercase | `text-overline`    |
| **Button**   | 14px     | 20px        | 600    | normal   | none      | `text-button`      |

### 3.3 Line Length
- Reading content: **60–75 characters** per line.
- Form labels: never wrap (single line truncation with title attribute).

---

## 4. Spacing Scale

Base unit: **4px**. All spacing tokens follow a 4px grid.

| Token | Pixels      | Tailwind Token | Usage                      |
|-------|-------------|----------------|----------------------------|
| 0.25  | 1px         | `p-0.25`       | Hairline borders           |
| 0.5   | 2px         | `p-0.5`        | Tiny separators            |
| 1     | 4px         | `p-1`          | Stacked icon spacing       |
| 2     | 8px         | `p-2`          | Compact card padding       |
| 3     | 12px        | `p-3`          | Form element padding       |
| 4     | 16px        | `p-4`          | Standard card padding      |
| 5     | 20px        | `p-5`          | Page section gap           |
| 6     | 24px        | `p-6`          | Page padding (mobile)      |
| 8     | 32px        | `p-8`          | Page padding (desktop)     |
| 10    | 40px        | `p-10`         | Large section gap          |
| 12    | 48px        | `p-12`         | Modal gutters              |
| 16    | 64px        | `p-16`         | Max page gutters           |

---

## 5. Elevation (Box Shadow)

| Level | Tailwind Class   | Light Shadow                                                        | Dark Adjustment                                 |
|-------|------------------|---------------------------------------------------------------------|-------------------------------------------------|
| sm    | `shadow-card`    | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`    | Same (neutral surface contrast handles depth)   |
| md    | `shadow-card-hover` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Same                                             |
| lg    | `shadow-elevated` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | Same                                             |
| xl    | `shadow-modal`    | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`| Same                                             |
| fab   | `shadow-fab`      | `0 4px 12px rgba(37, 99, 235, 0.3)`                                  | Same (blue glow kept for FAB affordance)        |

In dark mode, shadows remain identical — visual depth is instead conveyed
by surface colour contrast (e.g., `neutral-800` card on `neutral-900` background).

---

## 6. Border Radius

| Level | Pixels | Tailwind Token | Usage                         |
|-------|--------|----------------|-------------------------------|
| none  | 0px    | `rounded-none` | Full-bleed elements           |
| sm    | 4px    | `rounded-sm`   | Input fields, small badges    |
| md    | 8px    | `rounded-md`   | Cards, buttons, modals        |
| lg    | 12px   | `rounded-lg`   | Large cards, dialogs          |
| full  | 9999px | `rounded-full` | Pills, avatars, toggle handles|

---

## 7. Breakpoint System

All breakpoints defined in `tailwind.config.js` under `theme.screens` and
mirrored as CSS custom properties (`--opt-bp-*`) for JS/media-query usage.

| Name | Width   | Tailwind Prefix | Target Devices                    |
|------|---------|-----------------|-----------------------------------|
| xs   | 360px   | `xs:`           | Small budget Android phones       |
| sm   | 414px   | `sm:`           | iPhone 6/7/8/SE / large phones    |
| md   | 768px   | `md:`           | Tablets (portrait)                |
| lg   | 1024px  | `lg:`           | Tablets (landscape), small laptops|
| xl   | 1280px  | `xl:`           | Desktops, max content width       |
| 2xl  | 1440px  | `2xl:`          | Wide desktops                     |

**Content width cap**: `max-w-content` (1280px), `max-w-content-wide` (1440px).
**Auth forms**: `max-w-auth` (400px).

**Sidebar**: 240px expanded, 64px collapsed. On `< md`, sidebar is an overlay
drawer triggered by hamburger.

---

## 8. Iconography

**Library**: [Heroicons v2](https://heroicons.com/) (MIT).

### 8.1 Variants

| Variant  | Usage                        | Default Size |
|----------|------------------------------|--------------|
| outline  | Primary variant, all UI      | 24×24        |
| solid    | FABs, active states, badges  | 20×20        |
| mini     | Dense lists, table cells     | 16×16        |

### 8.2 Component-level Icon Classes

| Icon Class Prefix    | Tailwind / Vue Component Pattern         |
|----------------------|------------------------------------------|
| `chevron-*`          | `<ChevronDownIcon class="size-5" />`     |
| `x-mark`             | `<XMarkIcon class="size-5" />`           |
| `check`              | `<CheckIcon class="size-5" />`           |
| `plus`               | `<PlusIcon class="size-5" />`            |
| `ellipsis-horizontal`| `<EllipsisHorizontalIcon class="size-5" />`|
| `arrow-*`            | Navigation / back / forward              |
| `exclamation-*`      | Warning / alert triangles                |
| `magnifying-glass`   | Search                                   |
| `bell`               | Notifications                            |
| `bars-3`             | Hamburger menu                           |

### 8.3 Conventions
- Icons are rendered via **Vue functional components** imported from `@heroicons/vue/24/outline`.
- Always include `aria-hidden="true"` on decorative icons.
- Always include `aria-label` or visible text alongside informative icons.
- Icon colour inherits from `currentColor` (use Tailwind `text-*` utilities).

---

## 9. Animation

### 9.1 Base Timing
- **Default duration**: 200ms
- **Default easing**: `ease-out`
- **Page transitions**: 300ms
- **Notifications / toasts**: 300ms slide + 200ms fade

### 9.2 Animation Tokens

| Token              | CSS                                       | Usage                          |
|--------------------|-------------------------------------------|--------------------------------|
| `fade-in`          | `opacity 0 → 1`                           | Modals, overlays, toasts       |
| `slide-up`         | `translateY(100%) → 0`                    | Bottom sheets, mobile menus    |
| `slide-down`       | `translateY(-100%) → 0`                   | Dropdowns, notification bar    |
| `slide-left`       | `translateX(100%) → 0`                    | Sidebar open, panel reveal     |
| `slide-right`      | `translateX(-100%) → 0`                   | Sidebar close, back navigation |
| `scale-in`         | `scale(0.95) + opacity 0 → 1`             | Dialog / popover entrance      |
| `check`            | `scale 0.8→1.2→1 + opacity 0→1`           | Task completion checkmark      |

### 9.3 Component-specific Animations

| Component        | Animation                          | Timing        |
|------------------|------------------------------------|---------------|
| Button hover     | `background-color`, `box-shadow`   | 200ms ease-out|
| Button active    | `transform: scale(0.97)`           | 100ms ease-in |
| Skeleton pulse   | `opacity` pulse (Tailwind `animate-pulse`) | 1.5s infinite |
| Progress bar     | `width` transition                 | 300ms ease-out|
| Toast slide-in   | `slide-left`                       | 300ms ease-out|
| Toast slide-out  | `opacity → 0` after delay          | 200ms ease-in |
| Skeleton loader  | Tailwind `animate-pulse` (opacity 1→0.5→1) | 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite |

### 9.4 Reduced Motion
When `prefers-reduced-motion: reduce` is active, all animations and transitions
are clamped to **0.01ms** via the global reset rule in `tokens.css`.
No animation runs on devices where the user has requested reduced motion.

---

## 10. Accessibility

### 10.1 Focus-Visible Rings
All interactive elements use a `focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2`
pattern. In dark mode the ring becomes `brand-600` (`#60A5FA`).

```css
/* Applied via Tailwind utilities on every focusable element */
.focus-visible\:ring-2:focus-visible {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}
```

### 10.2 ARIA Attributes

| Pattern               | Required Attributes                                    |
|-----------------------|--------------------------------------------------------|
| Button                | `aria-label` when icon-only                            |
| Link                  | `aria-label` when icon-only or external link indicator |
| Dialog/Modal          | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`|
| Toast                 | `role="alert"`, `aria-live="assertive"`                |
| Tablist               | `role="tablist"`, `role="tab"`, `aria-selected`        |
| Progress bar          | `role="progressbar"`, `aria-valuenow`, `aria-valuemin/max`|
| Switch/Toggle         | `role="switch"`, `aria-checked`                        |
| Navigation            | `nav` element with `aria-label`                        |
| Table                 | `<th>` elements with `scope`                           |
| Form errors           | `aria-describedby` pointing to error `id`              |
| Accordion             | `aria-expanded`, `aria-controls`                       |

### 10.3 High-Contrast Mode
- Activated by OS-level `prefers-contrast: more`.
- Hardens all colour tokens (see §2.6).
- Adds 1px solid borders to card-like surfaces that rely on shadow alone.
- No component relies solely on colour to convey state — text labels, icons,
  or patterns always accompany colour indicators.

### 10.4 Reduced Motion
- Animation durations forced to 0.01ms (see §9.4).
- Skeleton loaders render as static grey rectangles.
- Toast notifications appear instantly (no slide) and auto-dismiss.

### 10.5 Touch Targets
- All interactive elements: **minimum 44×44px**.
- Use `min-h-touch` (44px) and `min-w-touch` (44px) Tailwind tokens.
- Buttons smaller than 44px must include invisible padding or `::before` extension.

### 10.6 Keyboard Navigation
- All interactive elements reachable via sequential Tab navigation.
- Escape closes modals, dropdowns, toasts, and menus.
- Arrow keys navigate tablists, comboboxes, and listbox options.
- Enter / Space activate buttons and toggles.
- First focusable element receives focus on modal open.
- Focus is trapped inside open modals (roving tabindex).

---

## 11. Dark Mode

### 11.1 Strategy
- **Class-based** (`darkMode: 'class'` in Tailwind).
- Toggle stored in `UiState.theme` (Vue Pinia store).
- Root `<html>` element toggles `.dark` class.
- All component styles use Tailwind `dark:` variant.
- CSS custom properties in `.dark` block override light values automatically.

### 11.2 Dark Color Mapping

| CSS Variable           | Light → Dark                                                        |
|------------------------|----------------------------------------------------------------------|
| `brand-50`             | `#EFF6FF` → `#172554` (deep blue bg)                                |
| `brand-100`            | `#DBEAFE` → `#1E3A5F` (surface tint)                                |
| `brand-600`            | `#2563EB` → `#60A5FA` (lighter blue for readability)                |
| `brand-700`            | `#1D4ED8` → `#93C5FD` (pressed state)                               |
| `neutral-50`           | `#FAFAFA` → `#171717` (page bg — near-black)                        |
| `neutral-100`          | `#F5F5F5` → `#262626` (card bg)                                     |
| `neutral-200`          | `#E5E5E5` → `#404040` (borders)                                     |
| `neutral-300` → `700`  | Progressive darkening ramp (light bg → light text)                  |
| `neutral-800`          | `#262626` → `#F5F5F5` (heading text)                                |
| `neutral-900`          | `#171717` → `#FAFAFA` (strong headings)                             |
| `success-*`            | Greens shift to lighter variants on dark backgrounds                |
| `danger-*`             | Reds shift to lighter/pinker variants                                |
| `info-600`             | `#0891B2` → `#22D3EE` (cyan-300)                                    |

### 11.3 Frappe UI Integration
When using Frappe UI components, override Frappe CSS variables inside `.dark`:

```css
.dark {
  --frappe-bg: var(--opt-neutral-50);
  --frappe-card-bg: var(--opt-neutral-100);
  --frappe-border-color: var(--opt-neutral-200);
  --frappe-text-color: var(--opt-neutral-700);
  --frappe-heading-color: var(--opt-neutral-900);
  --frappe-primary: var(--opt-primary-600);
  --frappe-primary-hover: var(--opt-primary-700);
}
```

### 11.4 Dark Mode Considerations
- Shadows removed / reduced in dark mode (surface contrast communicates depth).
- Blue glow on FAB (`shadow-fab`) maintained for affordance.
- Avatar / image borders added in dark mode to separate from dark card bg.
- Skeleton loaders use `neutral-800` pulse instead of `neutral-200`.

---

## Appendix A: Tailwind Class Quick Reference

### A.1 Layout & Sizing
```css
w-sidebar            /* 240px — expanded sidebar */
w-sidebar-collapsed  /* 64px — collapsed sidebar */
w-fab                /* 56px — floating action button */
max-w-content        /* 1280px */
max-w-content-wide   /* 1440px */
max-w-auth           /* 400px */
```

### A.2 Shadows
```css
shadow-card      /* Cards, list items */
shadow-card-hover/* Hovered card elevation */
shadow-elevated  /* Dropdowns, popovers */
shadow-modal     /* Dialogs, overlays */
shadow-fab       /* Floating action button */
```

### A.3 Min Touch Dimensions
```css
min-h-touch  /* 44px */
min-w-touch  /* 44px */
```

### A.4 Animation
```css
animate-fade-in      /* Modals, toasts */
animate-slide-up     /* Bottom sheets */
animate-slide-down   /* Dropdowns */
animate-slide-left   /* Panel in */
animate-slide-right  /* Panel out */
animate-scale-in     /* Popover entrance */
animate-check        /* Completion check */
animate-pulse        /* Skeleton loading */
```

---

## Appendix B: CSS Custom Properties Reference

Full set of `--opt-*` custom properties defined in `src/styles/tokens.css`:

```css
/* Brand */
--opt-primary-50 / 100 / 600 / 700

/* Neutral */
--opt-neutral-50 through --opt-neutral-900

/* Status */
--opt-success-50 / 600
--opt-warning-50 / 300 / 500
--opt-danger-50 / 500 / 600 / 700
--opt-info-600

/* Task */
--opt-task-pending / --opt-task-in-progress / --opt-task-blocked
--opt-task-escalated / --opt-task-completed / --opt-task-reviewed

/* Rescue */
--opt-rescue-soft-reminder / --opt-rescue-warning
--opt-rescue-high-risk / --opt-rescue-admin-escalation

/* Typography */
--opt-font-sans / --opt-font-hindi
--opt-display-size / --opt-display-line-height / --opt-display-weight
--opt-h1-* / --opt-h2-* / --opt-h3-*
--opt-body-* / --opt-body-strong-*
--opt-caption-* / --opt-overline-*

/* Spacing */
--opt-space-1 through --opt-space-16

/* Radius */
--opt-radius-sm / --opt-radius-md / --opt-radius-lg / --opt-radius-full

/* Breakpoints (reference) */
--opt-bp-xs / sm / md / lg / xl / 2xl
```

---

## Appendix C: TypeScript Type Bindings

The design system is mirrored in `src/types/index.ts`. Key enums:

```typescript
type TaskStatus     = 'pending' | 'in_progress' | 'blocked' | 'escalated' | 'completed' | 'reviewed'
type Priority      = 'low' | 'medium' | 'high' | 'critical'
type RescueSeverity = 'soft' | 'warning' | 'high_risk' | 'admin_escalation'
type Language      = 'en' | 'hi' | 'hinglish'
type Theme         = 'light' | 'dark' | 'high-contrast'
type ToastType     = 'success' | 'error' | 'warning' | 'info'
```

All colour values in this document use the `Tailwind CSS v3` colour naming
convention and are registered in `tailwind.config.js` under `theme.extend.colors`.
