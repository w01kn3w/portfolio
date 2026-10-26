---
name: Atajan portfolio
description: A personal digital sketchbook in motion.
colors:
  orange: "#f1653c"
  ink: "#191b18"
  paper: "#efefeb"
  muted: "#5a5d55"
  line: "#cccdc6"
  artwork: "#daddd4"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(96px,18.2vw,264px)"
    fontWeight: 650
    lineHeight: 1.14
    letterSpacing: "-.04em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(34px,4vw,58px)"
    fontWeight: 550
    lineHeight: 1.15
    letterSpacing: "-.035em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "28px"
    fontWeight: 550
    lineHeight: 1.25
    letterSpacing: "-.03em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
    lineHeight: 1.9
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "11px"
rounded:
  control: "6px"
  tag: "4px"
  circle: "50%"
spacing:
  tag-gap: "8px"
  copy-gap: "18px"
  mobile-gutter: "20px"
  tablet-gutter: "32px"
  desktop-gutter: "56px"
  column-gap: "65px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "17px 21px"
  button-text:
    textColor: "{colors.ink}"
    height: "44px"
  navigation:
    textColor: "{colors.ink}"
    height: "104px"
  tag:
    textColor: "{colors.ink}"
    rounded: "{rounded.tag}"
    padding: "6px 10px"
  project-art:
    backgroundColor: "{colors.artwork}"
    padding: "48px 42px 30px"
  contact-action:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.circle}"
    width: "100px"
    height: "100px"
---

# Design System: Atajan portfolio

## Overview

**Creative North Star: "A personal digital sketchbook in motion"**

A personal digital sketchbook in motion pairs an oversized name with a rotating line sculpture. Persimmon orange fills the introduction, cool paper holds the archive and about text, and ink closes the page with contact details.

Self-hosted Manrope carries every typographic role. Open columns, fine rules and drawn arrows keep the layout editorial. The miniature site preview supplies the only floating paper effect.

**Key Characteristics:**

- Solid orange, paper and ink fields.
- Oversized Manrope display type with tight tracking.
- Open project rows and fine rules.
- A pausable, pointer-responsive line sculpture.

## Colors

### Primary

Persimmon orange is the full introduction field and the accent for the circular email action and contact punctuation.

### Neutral

Ink is the main text and line color, primary action fill and contact background. Paper is the archive and about background, with reversed text inside dark actions and contact. The footer returns to the orange field. Muted supports descriptions and secondary headings. Line separates archive rows. Artwork is the cool gray-green surround behind project previews.

**The field rule.** Use orange for the introduction and focused contact accents, paper for reading sections, and ink for contact.

## Typography

Manrope is self-hosted as a variable TrueType font with weights 200 through 800 and swap loading. The frontmatter records desktop name, section heading, project title, descriptive body and metadata roles. The hero introduction has a smaller heading scale. Contact headings are larger than section headings and smaller than the name.

On phones, the name uses 24vw with line-height 1.16. Section headings settle at 38px, project titles at 27px and descriptive text at 13px. Desktop project descriptions have a 370px maximum width; about paragraphs have a 385px maximum. Labels and tags use mixed case.

**The shared type rule.** Keep Manrope across display, body and controls. Separate hierarchy through scale, weight and spacing.

## Layout

The centered container has a 1440px maximum width. Its gutters follow the desktop, tablet and mobile spacing tokens. At 1000px gutters and column gaps tighten. At 680px the hero, project and about layouts become single columns, with the sculpture below the introduction. The short about navigation link disappears while its section remains in the page. Contact details stack beneath the heading. At 1600px and above the hero lower composition gains a 420px minimum height.

Wide hero columns use a 1:1.08 ratio; project and about columns use 1.3:1. The desktop work section opens with 105px of space; about uses 100px above and 110px below. Phone work and about sections use 65px for their main vertical separation. Project entries use fine dividers rather than enclosing cards.

**The open row rule.** Keep project information beside its artwork on wide screens and below it on phones. Separate entries with fine rules.

## Elevation & Depth

Most depth comes from solid fields and fine rules. Only the miniature portfolio preview carries a soft shadow and resting tilt. Hover straightens it and lifts it slightly. The sculpture creates volume through overlapping ink strokes, without lighting, blur or texture. Keep the preview shadow specific to artwork.

## Shapes

Controls use compact rounded corners and tags use the smaller tag radius. The email action and wordmark dot are circles. Project artwork remains rectangular and clips its tilted preview. Thin elliptical rings form both the live sculpture and its miniature preview. Arrows use inline stroked SVGs.

## Components

### Primary and text actions

The primary project link uses ink fill, paper text and a drawn arrow. Hover lifts it by 3px and changes its fill. Phone padding and label size tighten. Text links underline on hover and move their arrow slightly. Navigation and text actions have 44px minimum target heights. The round contact action rotates on hover and shrinks to 52px on phones.

### Navigation

A compact lettermark anchors the masthead. Project, about and contact anchors sit beside it, with a project count derived from the content collection. The masthead uses a fine bottom divider and becomes shorter on phones.

### Project rows and tags

Each row pairs linked artwork with category, year, title, description, technology tags and source links. Tags use a thin gray-green border. The portfolio entry has a miniature site preview. Records without that preview type render title and technologies as generic artwork. A live-site link appears only when supplied by its record.

### Line sculpture

The canvas draws 38 rings in ink and responds to a fine pointer. Rotation uses requestAnimationFrame with bounded elapsed time. Drawing resolution is capped at twice CSS resolution. Offscreen and hidden-document states suspend the loop. The labelled pause button exposes its pressed state. Canvas content is hidden from assistive technology.

**The optional motion rule.** Keep the sculpture decorative and pausable. Render a still composition when reduced motion is requested.

### Contact and accessibility

The email remains a selectable mail link beside the copy control. Copy success or failure appears in a status region. A skip link becomes visible on keyboard focus. Links and buttons have an offset 3px focus outline. Contact actions switch that outline to orange against ink. Reduced-motion CSS removes transitions and smooth scrolling and neutralizes preview and circular action hover transforms. Touch-only devices suppress those hover transforms too.

## Do's and Don'ts

### Do:

- Do keep source links, technology tags and project descriptions outside preview artwork.
- Do retain keyboard focus, the skip link and the sculpture pause control.
- Do stack project and about columns at the phone breakpoint.

### Don't:

- Don't make decorative canvas content a requirement for reading or navigation.
- Don't hide contact actions inside artwork.
- Don't add continuous motion without preserving reduced-motion and visibility handling.
