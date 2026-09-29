---
name: Object Bloom — 458 Parts Explorer
description: Existing dark car studio with a cream and green inspection interface.
colors:
  studio: "#171c20"
  page: "#f4f4ef"
  inspection: "#e9eee7"
  ink: "#233432"
  primary: "#26483e"
  focus: "#178378"
  selected-row: "#dceade"
typography:
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
    lineHeight: 1.6
rounded:
  button: "9px"
  input: "8px"
---

# Design System: 458 Parts Explorer

## Overview

This is a bounded extension of the existing car viewer, not a new visual identity. Preserve its dark studio, pale inspection surfaces, restrained green controls and source model. The root PRODUCT.md governs product truth; the newer root homepage treatments do not replace this sample's established visual language.

The current model exposes 882 selectable modeled details, primarily connected surfaces. That count is not a claim of 882 physical or OEM parts. Source geometry supplies the experience; visual inspection and finish exploration are its purpose.

## Colors

The studio color contains the car and camera tools. The page and inspection colors separate configuration, selected-detail information and assembly controls without competing with the model. Dark green marks primary actions; pale green marks selected rows. The focus accent supplies a visible keyboard outline. Preserve light text within the dark stage and dark text on the pale panels.

## Typography

Self-hosted Manrope carries interface text, compact section headings and the Object Bloom wordmark. Georgia italic distinguishes “Italia.” in the model title. The model title is 38px on desktop and 32px on phones; section headings remain around 18–23px. Small metadata supports the model rather than becoming display copy. Mobile search and select fields use 16px text.

## Layout

Desktop pairs a flexible workspace with a 326px inspector, inside a maximum 1900px width. The inspector narrows to 286px below 1080px and expands to 360px at 1600px. The workspace orders the title, canvas, explicit inspection controls and selected-detail panel vertically. Explosion and X-ray controls stay below the canvas, with the parts browser beside it.

At 760px and below, the workspace and inspector stack in normal document flow. The stage is 370px tall, finish selectors share a row, and the parts list has a 340px scroll cap. Desktop stage height uses the final viewport-based rule, `clamp(390px, 50vh, 530px)`, keeping primary inspection controls near the model. Phone selection scrolls to the detail description; Focus part returns to the stage.

## Elevation & Depth

The interface relies on tonal panels and fine borders. Rounded stage toolbars and a lightly shadowed hover label sit over the canvas. The rendered car uses studio lighting and a soft contact footprint rather than per-part cast shadows. Assembly separation is spatial and ordered by group: wheels spread along their axles, glazing lifts, and panels retain their general front/rear placement. These are illustrative offsets, not mechanically validated removal paths.

## Shapes

Use gently rounded buttons and fields, circular finish swatches, pill-shaped detail counts and flat divided list rows. Preserve the existing compact proportions. Most controls have a 44px minimum height; some desktop camera controls and swatches are smaller. Phone swatches increase to 44px. Do not describe every current target as meeting a universal 44px minimum.

## Components

- **Stage:** drag to orbit, pinch to zoom, tap to select, plus explicit zoom buttons, front/side/rear/top views and reset. A static preview and loading status precede the model; failure provides a reload link.
- **Inspection:** independent explosion and X-ray sliders with numeric outputs, an Explode/Reassemble action and a user-triggered X-ray scan. No automatic disassembly on entry. Reduced motion snaps camera and assembly transitions and suppresses the moving scan.
- **Selection:** visible name, assembly, location and detail code, with Focus part, Show only this part and Clear selection. Selection highlights the surface and dims its surroundings. Detail codes are interface identifiers, not OEM numbers.
- **Inspector:** body swatches, cabin and wheel finishes, expandable lighting controls, search, assembly filtering and optional assembly isolation. Search covers labels, locations and assembly names. The list loads 40 results at a time and prioritizes larger body panels.
- **Accessibility and rendering:** retain semantic buttons, labeled inputs, pressed states, live status text, the skip link and visible keyboard focus. The parts list provides selection without canvas pointing. Rendering uses batched geometry, settles when idle, and suspends when hidden or outside the observed stage region. Initial pixel ratio is capped at 1.4 on phones and 1.65 elsewhere; this is a performance measure, not a device-performance guarantee.

## Do's and Don'ts

- Preserve connected source surfaces; do not divide arbitrary grids into invented parts. Brake rotor surfaces are deliberately grouped as single details even when disconnected.
- Keep the catalogue note and source attribution visible. Labels use source names, shape and location; some are inferred. Do not claim a factory catalogue, complete mechanical internals, engineering accuracy, service suitability or Ferrari affiliation.
- Preserve explicit inspection controls and the stacked mobile flow when extending the viewer. Avoid replacing its identity with the root site's newer visual treatments.
- Treat review as a conditional pass. This document records source inspection and the supplied 882-detail result; it does not establish independent browser, real-phone or mechanical validation. Resolve inferred naming and any remaining rendered-review findings before strengthening claims.


## Ordered tray revision

Fully exploded state settles to a uniform inspection tray (24 details per desktop page, 12 per phone page), sorted by assembly then size. Models scale to fit cells; explanatory copy states this. At assembled state their relative scales return to the source dimensions. Label buttons identify every displayed item; details and role descriptions appear immediately under the viewer. Previous/Next and assembly filters expose the full set. Camera controls recede in tray view to avoid covering labels.

A separately authored, explicitly illustrative V8 adds 48 selectable parts behind the cabin. Engine-only view, red cam covers, eight intake runners, eight ignition coils, exhaust primaries, sump and transmission housings are available. This is not Ferrari CAD or a validated working mechanism.

Animation scheduling guards against overlapping requestAnimationFrame chains, and interpolation snaps to settled endpoints. Layout and raycasts use the same batched geometry transforms.


## Complete layout refinement
The final tray now includes all 930 modeled details, including 48 illustrative engine pieces, without pagination. Responsive column counts preserve equal spacing. Assembly filters and Fit all visible parts support navigation. Pooled labels appear only at readable zoom levels; batched per-object frustum culling skips offscreen geometry. Opaque batches avoid transparent sorting. Idle rendering remains paused. Browser checks: 930 visible at full explosion, engine selection 48, descriptions selectable, no console errors or mobile overflow at 390px; idle frame count stable.
