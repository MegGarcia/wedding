# Images

This site is built from a Figma design that includes real engagement photos
(hero background, the "Save the Date" panel's floral wreath and wax-seal
close-up, the itinerary locket photo, and the three footer polaroids). This
sandboxed environment's network policy blocks direct access to `figma.com`,
so those photo assets could not be downloaded here — every photo spot
currently uses a tasteful CSS gradient placeholder instead, and the floral
wreath / wax seal are hand-built SVG/CSS approximations rather than the
actual photo-based assets from the file.

Everything else (fonts, colors, copy, spacing, and the mobile/desktop layout
differences) was pulled directly from the Figma file via the Figma MCP
server and should match closely.

To swap in the real photos, export them from Figma (or the couple's photo
library) and:

- Hero background: replace the `background` on `.hero` in `css/style.css`
  with `background-image: url("../images/hero.jpg");` (keep the dark
  gradient overlay layered on top for text contrast).
- Save-the-date panel: replace the `background` on `.date-panel` with the
  engagement photo; the `.date-panel__floral` SVG and `.date-panel__seal`
  circle can stay as decorative accents or be swapped for the real
  floral-wreath and wax-seal-photo crops.
- Itinerary photo: replace `.itinerary__photo`'s `background` with the
  couple's photo (it's clipped to an oval via `border-radius: 50%`).
- Footer collage: replace each `.polaroid--1/2/3::before`'s
  `background-image` with a photo.
