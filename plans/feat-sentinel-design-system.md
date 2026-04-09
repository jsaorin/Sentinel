# feat: Sentinel Design System

## Overview

Establish a complete, token-driven design system for Sentinel — an AI-powered multisig security scoring dashboard for Solana. The system is **dark-first** (security professionals work in low-light environments; vibrant risk colors demand high contrast), uses a blue-tinted near-black base palette, and applies vibrant status colors (red → orange → amber → green) to every risk-bearing UI element: scores, badges, alerts, and progress indicators.

Every future component and page inherits from this system. No raw hex values or hardcoded Tailwind scale colors (`gray-600`, `red-500`) appear in any component after this change — only semantic tokens.

---

## Problem Statement

The current codebase has:
- Zero design tokens — all colors are hardcoded Tailwind scale values (`bg-blue-600`, `bg-gray-100`)
- No typography setup — browser default system font renders everything
- No dark mode — components render white/light by default, wrong for a security dashboard
- No semantic color layer — swapping a theme or adding a light mode requires touching every component individually
- No risk-specific components — no `RiskBadge`, `ScoreIndicator`, `AlertBanner`, or `ProgressBar`

---

## Architecture: Three-Tier Token System

```
Tier 1 — Primitives   Raw color values. Never used directly in components.
Tier 2 — Semantics    Purpose-named tokens defined in @theme. Used in components.
Tier 3 — Components   Component-scoped CSS classes in @layer components.
```

```
globals.css @theme → CSS custom properties on :root → Tailwind utility classes
                                                      → Component classes via var()
```

---

## Technical Approach

### Fonts

Load via `next/font/google` in `layout.tsx`, expose as CSS variables, bridge into Tailwind `@theme inline`.

- **UI font**: `IBM Plex Sans` — designed for technical interfaces, excellent glyph disambiguation, enterprise authority
- **Mono font**: `JetBrains Mono` — best legibility for scores, wallet addresses, hashes, timestamps; tabular numerals by default

Both loaded with `variable` option to expose CSS vars. Applied to `<html>` via `className`. Bridged to `--font-sans` / `--font-mono` in Tailwind via `@theme inline`.

### Dark Mode

Class-based: `@custom-variant dark (&:where(.dark, .dark *))` in `globals.css`. The `.dark` class is added to `<html>` by default in `layout.tsx`. Security dashboards are dark-first; light mode is an optional override.

### Color Strategy

Status colors are vibrant, on dark backgrounds. All meet WCAG AA (4.5:1) against the `--color-bg-surface` background. Every status state includes a subtle fill variant (10–15% opacity) for badge backgrounds and alert surfaces.

### Component Library Additions

Four new components in `packages/ui`:
1. `RiskBadge` — replaces current `Badge`; includes icon + label + color, never color alone (colorblind-safe)
2. `ScoreDisplay` — large numeric score with contextual color, radial arc background, breathing animation at critical levels
3. `AlertBanner` — full-width contextual alert for critical warnings, proposal flags, system notices
4. `ProgressBar` — horizontal fill bar with semantic color by score range; used for security health indicators

---

## Implementation Plan

### Phase 1 — Token Foundation (`globals.css` + `layout.tsx`)

**File: `apps/web/src/app/globals.css`**

Replace current 2-line file with the full token system:

```css
@import "tailwindcss";

/* ── Content scanning ─────────────────────────────────────── */
@source "../../packages/ui/src";

/* ── Dark mode (class-based, .dark on <html>) ─────────────── */
@custom-variant dark (&:where(.dark, .dark *));

/* ── Font bridge (next/font → Tailwind) ───────────────────── */
@theme inline {
  --font-sans: var(--font-ibm-plex-sans);
  --font-mono: var(--font-jetbrains-mono);
}

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   All semantic tokens generate Tailwind utility classes:
   --color-critical → bg-critical, text-critical, border-critical
   ══════════════════════════════════════════════════════════════ */
@theme {
  /* ── Reset Tailwind's default palette ──────────────────── */
  --color-*: initial;

  /* ── Primitive palette (never use directly in components) ─ */

  /* Grays — blue-tinted near-black (not neutral gray) */
  --primitive-gray-950: #0A0F1E;
  --primitive-gray-900: #0D1117;
  --primitive-gray-850: #111827;
  --primitive-gray-800: #161B27;
  --primitive-gray-750: #1A1F2E;
  --primitive-gray-700: #1E2537;
  --primitive-gray-600: #252D3D;
  --primitive-gray-500: #374151;
  --primitive-gray-400: #4B5563;
  --primitive-gray-300: #6B7280;
  --primitive-gray-200: #9CA3AF;
  --primitive-gray-100: #D1D5DB;
  --primitive-gray-50:  #F9FAFB;

  /* Status primitives */
  --primitive-red-600:    #B91C1C;
  --primitive-red-500:    #DA1E28;
  --primitive-red-400:    #FC3E4E;
  --primitive-red-300:    #FF6B74;
  --primitive-orange-500: #EA580C;
  --primitive-orange-400: #FF9345;
  --primitive-orange-300: #FFB07C;
  --primitive-amber-500:  #D97706;
  --primitive-amber-400:  #FFBA00;
  --primitive-amber-300:  #FFCF40;
  --primitive-green-600:  #166534;
  --primitive-green-500:  #16A34A;
  --primitive-green-400:  #3DD68C;
  --primitive-green-300:  #6EE7A8;
  --primitive-emerald:    #10B981;
  --primitive-blue-500:   #2563EB;
  --primitive-blue-400:   #4B9FE5;
  --primitive-blue-300:   #7DD3FC;
  --primitive-white:      #FFFFFF;
  --primitive-black:      #000000;

  /* ── Semantic Status Colors ────────────────────────────── */

  /* Risk levels — used for scores, badges, alerts, progress */
  --color-critical:        #FC3E4E;
  --color-critical-subtle: oklch(62.8% 0.257 25 / 0.12);
  --color-critical-border: oklch(62.8% 0.257 25 / 0.35);
  --color-critical-glow:   oklch(62.8% 0.257 25 / 0.40);

  --color-high:        #FF9345;
  --color-high-subtle: oklch(73% 0.18 46 / 0.12);
  --color-high-border: oklch(73% 0.18 46 / 0.35);

  --color-medium:        #FFBA00;
  --color-medium-subtle: oklch(83% 0.17 84 / 0.12);
  --color-medium-border: oklch(83% 0.17 84 / 0.35);

  --color-low:        #3DD68C;
  --color-low-subtle: oklch(77% 0.17 155 / 0.12);
  --color-low-border: oklch(77% 0.17 155 / 0.35);

  --color-safe:        #10B981;
  --color-safe-subtle: oklch(72% 0.17 162 / 0.12);
  --color-safe-border: oklch(72% 0.17 162 / 0.35);

  --color-info:        #4B9FE5;
  --color-info-subtle: oklch(70% 0.13 230 / 0.12);
  --color-info-border: oklch(70% 0.13 230 / 0.35);

  /* Unknown/unscored state */
  --color-unknown:        #6B7280;
  --color-unknown-subtle: rgba(107, 114, 128, 0.12);
  --color-unknown-border: rgba(107, 114, 128, 0.35);

  /* ── Background Surfaces (dark-first) ──────────────────── */
  --color-bg-base:    #0A0F1E;
  --color-bg-surface: #0D1117;
  --color-bg-card:    #111827;
  --color-bg-raised:  #161B27;
  --color-bg-overlay: #1E2537;
  --color-bg-hover:   rgba(255, 255, 255, 0.04);
  --color-bg-active:  rgba(255, 255, 255, 0.07);

  /* ── Text Hierarchy ────────────────────────────────────── */
  --color-text-primary:   rgba(249, 250, 251, 0.92);
  --color-text-secondary: rgba(249, 250, 251, 0.60);
  --color-text-tertiary:  rgba(249, 250, 251, 0.38);
  --color-text-disabled:  rgba(249, 250, 251, 0.20);
  --color-text-inverse:   #0A0F1E;
  --color-text-link:      #4B9FE5;
  --color-text-link-hover: #7DD3FC;

  /* ── Borders ───────────────────────────────────────────── */
  --color-border-subtle:  rgba(255, 255, 255, 0.06);
  --color-border-default: rgba(255, 255, 255, 0.12);
  --color-border-strong:  rgba(255, 255, 255, 0.22);

  /* ── Interactive (primary brand) ───────────────────────── */
  --color-primary:       #4B9FE5;
  --color-primary-hover: #2563EB;
  --color-primary-muted: rgba(75, 159, 229, 0.15);

  /* ── Utility ───────────────────────────────────────────── */
  --color-white:       #FFFFFF;
  --color-black:       #000000;
  --color-transparent: transparent;

  /* ── Typography ────────────────────────────────────────── */
  --text-xs:   0.6875rem;  /* 11px — timestamps, meta */
  --text-sm:   0.75rem;    /* 12px — data labels */
  --text-base: 0.8125rem;  /* 13px — body text */
  --text-md:   0.875rem;   /* 14px — card titles */
  --text-lg:   1rem;       /* 16px — section headings */
  --text-xl:   1.125rem;   /* 18px — page subheadings */
  --text-2xl:  1.25rem;    /* 20px — page headings */
  --text-3xl:  1.5rem;     /* 24px — hero values */
  --text-4xl:  2rem;       /* 32px — score numbers */
  --text-5xl:  3rem;       /* 48px — hero score */
  --text-6xl:  4rem;       /* 64px — large score display */

  --font-weight-regular:   400;
  --font-weight-medium:    500;
  --font-weight-semibold:  600;
  --font-weight-bold:      700;

  --leading-none:    1;
  --leading-tight:   1.25;
  --leading-snug:    1.375;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;

  --tracking-tight:  -0.025em;
  --tracking-normal: 0em;
  --tracking-wide:   0.025em;
  --tracking-wider:  0.05em;
  --tracking-widest: 0.1em;

  /* ── Border Radius ─────────────────────────────────────── */
  --radius-none: 0;
  --radius-xs:   2px;
  --radius-sm:   4px;
  --radius-md:   6px;
  --radius-lg:   8px;
  --radius-xl:   12px;
  --radius-2xl:  16px;
  --radius-full: 9999px;

  /* ── Shadows ───────────────────────────────────────────── */
  --shadow-xs:  0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-sm:  0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md:  0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.5), 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-xl:  0 20px 40px rgba(0, 0, 0, 0.6);
  --shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.4);

  /* Status glow shadows — applied at critical/safe extremes */
  --shadow-glow-critical: 0 0 0 1px var(--color-critical-border),
                          0 0 16px var(--color-critical-glow);
  --shadow-glow-safe:     0 0 0 1px var(--color-safe-border),
                          0 0 12px var(--color-safe-subtle);

  /* ── Spacing ───────────────────────────────────────────── */
  --spacing: 0.25rem; /* 4px base */

  /* ── Breakpoints ───────────────────────────────────────── */
  --breakpoint-sm:  640px;
  --breakpoint-md:  768px;
  --breakpoint-lg:  1024px;
  --breakpoint-xl:  1280px;
  --breakpoint-2xl: 1440px;

  /* ── Animations ────────────────────────────────────────── */
  --animate-pulse-critical: pulse-critical 2.5s ease-in-out infinite;
  --animate-fade-in:        fade-in 0.2s ease-out;
  --animate-slide-up:       slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes pulse-critical {
    0%, 100% { box-shadow: 0 0 8px rgba(252, 62, 78, 0.3); }
    50%       { box-shadow: 0 0 24px rgba(252, 62, 78, 0.65); }
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes slide-up {
    from { transform: translateY(6px); opacity: 0; }
    to   { transform: translateY(0);   opacity: 1; }
  }
}

/* ── Base Styles ───────────────────────────────────────────── */
@layer base {
  html {
    background-color: var(--color-bg-base);
    color: var(--color-text-primary);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-feature-settings: "kern" 1, "liga" 1;
  }

  /* Monospace — tabular numerals for all mono text */
  code, pre, kbd, .font-mono {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
  }

  /* All numeric score displays use tabular numerals */
  .tabular-nums {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum" 1;
  }

  /* Scrollbar styling for dark theme */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track  { background: var(--color-bg-base); }
  ::-webkit-scrollbar-thumb  { background: var(--color-border-default); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--color-border-strong); }

  /* Focus ring — visible but not distracting */
  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  * { box-sizing: border-box; }
}
```

**File: `apps/web/src/app/layout.tsx`**

```tsx
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sentinel",
  description: "AI-powered multisig security scoring for Solana",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${ibmPlexSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-bg-base text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
```

Note: `className="dark"` on `<html>` activates dark mode by default. When a light-mode toggle is added later, a client component wraps `<html>` and toggles this class.

---

### Phase 2 — Update Existing Components

Migrate the three existing components in `packages/ui` from hardcoded scale values to semantic tokens.

**`packages/ui/src/components/Button/Button.tsx`**

Remove hardcoded `blue-600`, `gray-100`, `red-600`. Map to tokens:
- `primary` → `bg-primary` / `hover:bg-primary-hover` / `text-text-inverse`
- `secondary` → `bg-bg-raised` / `hover:bg-bg-overlay` / `text-text-primary` / `border-border-default`
- `ghost` → `hover:bg-bg-hover` / `text-text-secondary`
- `destructive` → `bg-critical` / `hover:bg-critical` / `text-white`

**`packages/ui/src/components/Card/Card.tsx`**

Remove hardcoded `bg-white`, `border-gray-200`.
- Base → `bg-bg-card border-border-default`
- Add `variant` prop: `default` | `raised` | `outlined`
  - `default`: `bg-bg-card border border-border-subtle`
  - `raised`: `bg-bg-raised border border-border-default shadow-md`
  - `outlined`: `bg-transparent border border-border-strong`

**`packages/ui/src/components/Badge/Badge.tsx`**

Remove hardcoded `green-100/800`, `yellow-100/800`, `red-100/800`, `blue-100/800`.
- Map variants to: `critical`, `high`, `medium`, `low`, `info`, `safe`, `unknown`
- Each uses: `bg-{variant}-subtle border border-{variant}-border text-{variant}`
- Rename internal variant names to match risk taxonomy

---

### Phase 3 — New Risk Components

**`packages/ui/src/components/RiskBadge/RiskBadge.tsx`**

Replaces the simple `Badge`. Renders: icon + text label + color. Never uses color as the sole indicator (colorblind-safe requirement).

```tsx
type RiskLevel = "critical" | "high" | "medium" | "low" | "safe" | "info" | "unknown";

type RiskBadgeProps = {
  level: RiskLevel;
  showIcon?: boolean;       // default: true
  showLabel?: boolean;      // default: true
  size?: "sm" | "md";
};
```

Icon map (from lucide-react or inline SVGs):
- `critical` → `AlertOctagon` (filled)
- `high` → `AlertTriangle`
- `medium` → `AlertCircle`
- `low` → `CheckCircle`
- `safe` → `ShieldCheck`
- `info` → `Info`
- `unknown` → `HelpCircle`

Color map: uses `--color-{level}` tokens for text and border, `--color-{level}-subtle` for background.

**`packages/ui/src/components/ScoreDisplay/ScoreDisplay.tsx`**

Large numeric score for hero widgets.

```tsx
type ScoreDisplayProps = {
  score: number;           // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;     // shows "CRITICAL" / "HIGH" / etc. below score
  animated?: boolean;      // pulse glow at score < 30
};
```

Score → risk level mapping:
```
0–19:   critical
20–39:  high
40–59:  medium
60–79:  low
80–100: safe
```

The score number renders in `font-mono` (JetBrains Mono) with the level color applied to the text. At `animated && score < 30`, applies `animate-pulse-critical` to the wrapper.

**`packages/ui/src/components/AlertBanner/AlertBanner.tsx`**

Full-width contextual alert for proposal warnings, system notices.

```tsx
type AlertBannerProps = {
  level: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: { label: string; onClick: () => void };
};
```

Layout: left colored border (4px) + subtle background fill + icon + title + description + optional dismiss button + optional action.

**`packages/ui/src/components/ProgressBar/ProgressBar.tsx`**

Horizontal security health bar.

```tsx
type ProgressBarProps = {
  value: number;           // 0-100
  label?: string;
  showValue?: boolean;
  size?: "xs" | "sm" | "md";
  colorByValue?: boolean;  // auto-colors by score range (default: true)
  color?: string;          // manual override
};
```

Track background: `bg-bg-overlay`. Fill: `bg-{level}` based on `value`. Transition: `transition-all duration-500 ease-out`.

---

### Phase 4 — Component Barrel Updates

Update `packages/ui/src/components/index.ts` and `packages/ui/src/index.ts` to export all new components.

---

### Phase 5 — Memory File

Save `design_system.md` to the project memory at:
```
/Users/alvaroteranrodriguez/.claude/projects/-Users-alvaroteranrodriguez-Desktop-Sentinel/memory/design_system.md
```

This file is loaded at the start of every conversation. It contains:
- The full token reference (color names, what they mean)
- Component inventory (what exists, what props it takes)
- Rules for new components (no hardcoded colors, always use semantic tokens, always include icon+label in risk indicators)
- Font names and where they're configured
- Dark mode strategy

---

## Acceptance Criteria

### Token Layer
- [ ] `globals.css` has `@theme` block with all primitive, semantic, and status tokens
- [ ] `@custom-variant dark` defined for class-based dark mode
- [ ] `@theme inline` bridges `next/font` CSS variables to `--font-sans` / `--font-mono`
- [ ] `@layer base` sets `html` background, color, font-family, scrollbar, focus-visible
- [ ] All tokens generate Tailwind utility classes (verified by using `bg-critical`, `text-text-secondary`, etc. in a component)

### Typography
- [ ] `IBM_Plex_Sans` loaded in `layout.tsx` with `variable: "--font-ibm-plex-sans"`, weights 400/500/600/700
- [ ] `JetBrains_Mono` loaded in `layout.tsx` with `variable: "--font-jetbrains-mono"`
- [ ] Both applied to `<html>` via `className`
- [ ] `font-mono` elements render in JetBrains Mono with tabular numerals

### Dark Mode
- [ ] `<html>` has `class="dark"` by default
- [ ] Background is `#0A0F1E` (dark near-black), not white
- [ ] `dark:` variants work on components

### Existing Components
- [ ] `Button` uses only semantic token classes — no `blue-600`, `gray-100`, `red-600`
- [ ] `Card` uses only semantic token classes — no `bg-white`, `border-gray-200`
- [ ] `Badge` renamed variants: `critical`, `high`, `medium`, `low`, `info`, `safe`, `unknown`

### New Components
- [ ] `RiskBadge` — renders icon + label, 7 risk levels, uses semantic colors
- [ ] `ScoreDisplay` — monospace score number, colored by risk, pulse at < 30
- [ ] `AlertBanner` — left-bordered alert, dismissible, optional action
- [ ] `ProgressBar` — auto-colors by value range, track + fill, smooth transition

### Accessibility
- [ ] Every `RiskBadge` includes an icon (non-color encoding)
- [ ] Every `RiskBadge` includes a text label (non-color encoding)
- [ ] `ScoreDisplay` includes `aria-label` with full score description
- [ ] `ProgressBar` includes `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- [ ] All status text on dark backgrounds meets 4.5:1 contrast ratio (verified)

### Build
- [ ] `pnpm build:web` completes with no errors after all changes
- [ ] `pnpm test:web` passes
- [ ] `pnpm lint` passes (no raw hex in components, no hardcoded scale colors)

---

## File Map

```
Modified:
  apps/web/src/app/globals.css          ← Full @theme token system
  apps/web/src/app/layout.tsx           ← next/font setup + dark class
  apps/web/src/app/page.tsx             ← Update to use token classes
  packages/ui/src/components/Button/Button.tsx    ← Semantic tokens
  packages/ui/src/components/Card/Card.tsx        ← Semantic tokens + variant prop
  packages/ui/src/components/Badge/Badge.tsx      ← Risk taxonomy variants

Created:
  packages/ui/src/components/RiskBadge/RiskBadge.tsx
  packages/ui/src/components/RiskBadge/index.ts
  packages/ui/src/components/ScoreDisplay/ScoreDisplay.tsx
  packages/ui/src/components/ScoreDisplay/index.ts
  packages/ui/src/components/AlertBanner/AlertBanner.tsx
  packages/ui/src/components/AlertBanner/index.ts
  packages/ui/src/components/ProgressBar/ProgressBar.tsx
  packages/ui/src/components/ProgressBar/index.ts
  packages/ui/src/components/index.ts              ← Updated barrel
  apps/web/CLAUDE.md                               ← Frontend layer rules
  packages/ui/CLAUDE.md                            ← UI component rules
```

---

## Risk Analysis

| Risk | Mitigation |
|------|-----------|
| OKLCH `color-mix()` not supported on older browsers | Use hex fallbacks alongside OKLCH. Tailwind v4 emits OKLCH by default; add `@supports` guard or use hex for subtle colors |
| `IBM_Plex_Sans` increases initial bundle | Use `display: "swap"` and subset to `latin` only; consider `next/font` preloading |
| Tailwind `--color-*: initial` wipes ALL default colors | Any component using default scale classes (`gray-600`, `blue-500`) breaks immediately. Migration must be atomic per component |
| `JetBrains_Mono` is a large font file | Load with `display: "swap"` and only the `latin` subset |

---

## References

- [Tailwind v4 Theme Variables](https://tailwindcss.com/docs/theme) — `@theme`, `@theme inline`, CSS variable generation
- [Tailwind v4 Dark Mode](https://tailwindcss.com/docs/dark-mode) — `@custom-variant dark`
- [next/font Google](https://nextjs.org/docs/app/api-reference/components/font) — `variable` option, CSS vars
- [IBM Carbon Color System](https://carbondesignsystem.com/guidelines/color/overview/) — severity token patterns
- [IBM Carbon Status Indicator Pattern](https://carbondesignsystem.com/patterns/status-indicator-pattern/) — icon + color + label requirement
- [WCAG 1.4.1](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html) — color not sole indicator
- [CVSS v4.0 Severity Levels](https://www.first.org/cvss/specification-document) — critical/high/medium/low/info taxonomy
- [Designing Colorblind-Accessible Dashboards](https://medium.com/@courtneyjordan/designing-color-blind-accessible-dashboards-ba3e0084be82)
- Existing codebase: `packages/ui/src/components/` — current component structure to migrate
