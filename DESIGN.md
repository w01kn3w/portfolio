---
name: Atajan portfolio
description: Dark editorial engineering portfolio with geometric interaction studies.
colors:
  bg: "#0b100f"
  panel: "#111917"
  text: "#e9ece6"
  line: "#303a35"
  muted: "#a4afa7"
  lime: "#c5f16c"
  lime-hover: "#dcffa1"
  on-lime: "#17200f"
  artwork: "#1c2925"
  error: "#ffc5ad"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(54px, 6.75vw, 102px)"
    fontWeight: 500
    lineHeight: 1.09
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(36px, 4.1vw, 62px)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "27px"
    fontWeight: 500
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "13px"
    lineHeight: 1.8
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "12px"
  code:
    fontFamily: "monospace"
    fontSize: "12px"
rounded:
  square: "0"
  circle: "50%"
spacing:
  phone-gutter: "22px"
  tablet-gutter: "36px"
  desktop-gutter: "64px"
  section-gap: "105px"
components:
  button-primary:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.on-lime}"
    rounded: "{rounded.square}"
    padding: "17px 23px"
  button-primary-hover:
    backgroundColor: "{colors.lime-hover}"
  button-text:
    textColor: "{colors.text}"
    height: "44px"
  input:
    textColor: "{colors.text}"
    rounded: "{rounded.square}"
    padding: "10px 0 16px"
  navigation:
    textColor: "{colors.text}"
  project-art:
    backgroundColor: "{colors.artwork}"
  contact-action:
    textColor: "{colors.lime}"
    rounded: "{rounded.circle}"
---

# Design System: Atajan portfolio

## Overview

**Creative North Star: "Engineering after dark"**

A near-black editorial page presents engineering through large type, precise rules and a geometric line sculpture. The interface remains open and readable. Lime marks actions and selected states; muted green-gray supports longer explanations.

The approved dark, English-language redesign replaces the former orange-and-paper direction. The finished build uses a graphite green undertone rather than literal midnight blue. Its signature artwork comes from Canvas 2D and CSS geometry, without borrowed project screenshots or a WebGL runtime.

**Key Characteristics:**

- Oversized Manrope headlines with tight tracking.
- Open section layouts separated by fine rules.
- Sparse electric lime accents on graphite fields.
- Optional motion with direct keyboard alternatives.

## Colors

### Primary

Electric lime identifies primary actions, emphasis, selected process stages and architecture nodes. Its lighter hover variant belongs to primary buttons. Dark on-lime text keeps those filled controls legible.

### Neutral

The background and panel tokens form the dark field. Cold off-white carries main text, muted green-gray carries supporting copy, and the line token separates sections. The artwork field is a lighter green graphite. The warm error tone is reserved for failed contact feedback.

**The accent rule.** Use lime for action and state; keep reading surfaces dark and text predominantly off-white.

Cyan appears within the decorative sculpture, not as a second general-purpose interface accent. Violet is not an implemented token.

## Typography

Display and body use self-hosted variable Manrope in WOFF2 format with a sans-serif fallback. The same font file is preloaded. Monospace is restricted to code and artwork coordinates. The font loads with `font-display: swap`.

The frontmatter records the main hierarchy. Project titles use the title role; body paragraphs generally use 13px with generous leading. Hero support copy uses 14px. About and contact introductions use 21px. Technical metadata is smaller and subordinate to the reading text.

The hero changes to 108px above 1600px. At 760px and below it uses `clamp(38px, 7.7vw, 58px)`. Section-specific contact and about headings retain their own responsive scales in `src/styles.css`.

**The shared voice rule.** Separate hierarchy through size, spacing and weight while keeping Manrope across headings, controls and prose.

## Layout

The main container caps at 1512px and uses the three gutter tokens. Breakpoints are 1600px for the wide hero, 1100px for reduced gutters and tighter columns, and 760px for stacked content. The desktop masthead is 112px tall and becomes 84px on phones.

Large section gaps and asymmetrical columns set the rhythm. A single large project artwork leads into descriptive text and an expandable case study. The engineering diagram uses five horizontal nodes, then a vertical sequence on phones. About, stack and contact columns become single-column layouts. The engineering navigation anchor is hidden on phones while the section remains in the page.

**The open layout rule.** Use fine rules and unequal columns to organize information before introducing additional containers.

## Elevation & Depth

The system uses tonal fields, restrained radial artwork lighting, line grids and overlapping geometry. It has no box-shadow elevation vocabulary. The sculpture sits behind the hero text; project rings rotate within their clipped artwork area. Ordinary reading content remains flat.

## Shapes

Buttons, inputs and content fields have square corners. Circles belong to the sculpture, architecture symbols, cursor and email action. Borders are thin and muted. Artwork is clipped by its rectangular container; the circles inside it remain part of the composition.

## Components

### Buttons and links

Primary buttons use the frontmatter fill, text and padding, with a 55px minimum height. Hover lightens the fill and moves the inline SVG arrow slightly. Text actions have a 44px minimum height and turn lime on hover. Keyboard focus uses a 2px lime outline with a 6px offset. Disabled submission controls become translucent and show the waiting cursor.

### Navigation

The masthead uses 13px anchor links with 38px gaps and 44px minimum hit height. Hover changes text to lime. At the phone breakpoint, links use 11px type and 20px gaps. Keep meaningful anchor labels and a visible focus treatment.

### Project artwork and case study

A full-width graphite artwork combines original CSS rings, a fading coordinate grid and oversized type. It links to the in-page case study with a VIEW cursor state. Hover rotates the rings and shifts the type. The native details element exposes the problem, implementation and verified stack; content stays accessible without animation.

### Contact fields

Inputs and textarea are transparent, square and underlined. Labels remain visible above fields. Focus retains a lime outline with a smaller 4px offset. Loading, delivery confirmation and error feedback appear in a reserved status area. Only a confirmed backend response produces success.

### Architecture and process

Architecture layers are buttons with pressed state and a changing explanatory region. The database node is explicitly reference-only. Process controls select explanatory text, with lime filling the selected stage. Preserve keyboard state semantics and do not rely on color alone.

### Technology map

Technology categories are keyboard-operable buttons with `aria-expanded`. Opening a category reveals its source-evidence explanation and repository link. Preserve the explicit unverified database category instead of suggesting a database implementation or inventing proficiency scores.

### Sculpture and cursor

The Canvas sculpture is decorative, pausable and pointer-responsive. It pauses when hidden or outside the viewport. Reduced motion retains a still composition. The desktop cursor has a direct core and an eased outer ring; selected actions receive moderate magnetic translation. It is enabled only for fine pointers with hover and no reduced-motion preference. It never captures clicks.

**The optional motion rule.** Keep content and controls usable without animation; respect reduced motion and suspend decorative work when hidden.

## Do's and Don'ts

### Do:

- Do preserve visible focus, the skip link and direct anchor navigation.
- Do distinguish implemented functionality from illustrative architecture.
- Do keep status feedback explicit when contact delivery is unavailable.
- Do stack explanatory content and architecture controls on phones.

### Don't:

- Don't add unsupported projects, testimonials or proficiency percentages.
- Don't make decorative graphics necessary for reading or navigation.
- Don't apply the desktop cursor to touch or reduced-motion interfaces.
- Don't restore the superseded orange palette or Russian interface copy.
