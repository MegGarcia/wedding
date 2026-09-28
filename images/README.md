# Images

Real photos from the couple, matched to the Figma design:

| File | Used for |
|---|---|
| `hero.jpg` | Hero background photo |
| `calendar-grid.png` | Rotated calendar-grid accent behind "Save the Date" |
| `floral-branch.png` | Magnolia branch accent on the save-the-date panel |
| `floral-babys-breath.png` | Baby's breath sprig accent layered with the branch |
| `seal.png` | Wax seal (M/Y monogram) on the save-the-date panel |
| `itinerary-photo.png` | Oval locket photo next to the itinerary |
| `footer-1.jpg`, `footer-2.jpg`, `footer-3.jpg` | The three footer polaroids |
| `photo-strip.png` | Rotated photo-strip accent on the login gate |

All images were provided by the couple, then resized/compressed for the
web (JPEG for opaque photos, optimized PNG for the assets with
transparency) — see the git history for the exact conversion.

## New pages (Itinerary / Travel & Stay / FAQ / Registry)

Sourced from the Figma "Wedding" file (`aJq1esIClm2uUHuRjpbQ6D`), with the
couple's permission, for the 5 new pages added alongside the original
save-the-date page.

| File | Used for |
|---|---|
| `itin-hero.jpg` | Itinerary page hero photo |
| `itin-dresscode-01.jpg` … `itin-dresscode-07.jpg` | Itinerary page dress-code inspiration grid |
| `itin-venue.jpg` | La Grande Kaz location map on the Itinerary page |
| `travel-hero.jpg` | Travel & Stay page hero photo |
| `travel-map.png` | Mauritius pin-map graphic on the Travel & Stay page |
| `faq-hero.jpg` | FAQ page hero photo |
| `registry-hero.jpg` | Registry page hero photo |

These were captured as rendered screenshots of the Figma nodes (via the
Figma MCP's `get_screenshot`) rather than the original uploaded source
files, because this session's network policy doesn't allow outbound
requests to `figma.com` (needed to download the raw asset URLs directly).
Visually they match the design exactly; if pixel-identical originals are
ever wanted, download them from the Figma file directly.

### Pending (Figma rate limit)

The Figma MCP tool call limit (Starter plan) was hit partway through this
build, before these could be downloaded:

| File (once added) | Used for |
|---|---|
| `itin-dresscode-08.jpg` … `itin-dresscode-12.jpg` | Remaining 5 of the Itinerary dress-code grid's 12 photos — the grid currently repeats `01`–`05` as placeholders in their place |
| `travel-hotel-victoria-beachcomber.jpg` | Victoria Beachcomber hotel card, Travel & Stay page |
| `travel-hotel-ravenala-attitude.jpg` | Ravenala Attitude hotel card |
| `travel-hotel-le-meridien.jpg` | Le Méridien hotel card |
| `travel-hotel-be-cosy.jpg` | Be Cosy by LOV hotel card |
| `travel-hotel-voile-bleue.jpg` | Voile Bleue Boutique hotel card |
| `travel-hotel-airbnb.jpg` | AirBnb card, Travel & Stay page |
| `travel-flights.jpg` | Flights section photo, Travel & Stay page |
| `travel-seven-coloured-earths.jpg` | "Seven Coloured Earths" callout card, Travel & Stay page |

Until these are added, `travel-stay.html` and `itinerary.html` show a
diagonal-striped "Photo pending" placeholder in their place (see
`.placeholder-photo` in `css/style.css`). Either wait for the Figma tool
call limit to reset and re-run the same `get_screenshot` fetches, or
upgrade the Figma plan referenced in the tool's error message, then swap
the placeholder markup for `<img>` tags pointing at the downloaded files.
