# ADR 0009: lucide-react as the icon library

## Status
Accepted

## Context
The frontend has no icon library (ADR 0003's dependency list is Tailwind CSS + TanStack Query + React Router only). Every icon so far — back arrows, spinners, error markers — is a hand-rolled inline SVG duplicated per component. The Reddit-style redesign needs a consistent set of icons (heart/thumbs-down for reactions, comment/menu/nav icons) across many components, which makes hand-rolling each one error-prone and inconsistent in stroke width/viewBox.

## Decision
Adopt `lucide-react` as the one icon library for the frontend. Import icons as components (`import { Heart, ThumbsDown } from "lucide-react"`) rather than continuing to inline `<svg>` markup for new icons.

## Consequences
- One new frontend dependency (`client/package.json`); tree-shakeable (only imported icons ship), no runtime CSS, and its default stroke-based style matches the look the hand-rolled SVGs were already going for, so the visual change is additive rather than a style clash.
- Existing hand-rolled SVGs in touched components (back-arrow, spinner, error icon, empty-state icon) are replaced by the equivalent lucide icon as those components are edited; hand-rolled SVGs in untouched components are left alone rather than churned for their own sake.
- `client/public/icons.svg` (an unused social-icon sprite predating this ADR) is unaffected — it was already dead code and this decision doesn't change that.
