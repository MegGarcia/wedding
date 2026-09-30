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
| `itin-hero.jpg` | Itinerary page hero photo -- a real photo the couple uploaded directly, replacing the earlier Figma-screenshot placeholder |
| `itin-dresscode-01.png` … `itin-dresscode-07.png` | Itinerary page dress-code inspiration grid -- re-uploaded by the couple as PNG, replacing the earlier Figma-screenshot JPGs of the same name |
| `itin-dresscode-08.jpg` … `itin-dresscode-12.jpg` | Itinerary page dress-code inspiration grid, continued |
| `itin-venue.jpg` | No longer referenced by any page -- the Itinerary page's venue section now embeds a live Google Maps iframe instead. Left in this folder for git history's sake and can be deleted if you'd like a smaller repo. |
| `travel-hero.jpg` | Travel & Stay page hero photo |
| `travel-map.svg` | Base island silhouette for the interactive map on the Travel & Stay page |
| `travel-hotel-victoria-beachcomber.jpg` | Victoria Beachcomber hotel card |
| `travel-hotel-ravenala-attitude.jpg` | Ravenala Attitude hotel card |
| `travel-hotel-le-meridien.jpg` | Le Méridien hotel card |
| `travel-hotel-be-cosy.jpg` | Be Cosy by LOV hotel card |
| `travel-hotel-voile-bleue.jpg` | Voile Bleue Boutique hotel card |
| `travel-hotel-airbnb.jpg` | AirBnb card, Travel & Stay page |
| `travel-flights.jpg` | Flights section photo, Travel & Stay page |
| `travel-seven-coloured-earths.jpg` | Chamarel Seven Coloured Earths marker photo on the interactive map, Travel & Stay page |
| `faq-hero.jpg` | FAQ page hero photo |
| `registry-hero.jpg` | Registry page hero photo -- a real engagement photo the couple uploaded directly, replacing the earlier Figma-screenshot placeholder |
| `registry-hero-old.jpg` | No longer referenced by any page -- the earlier Registry page hero photo (a Figma-screenshot placeholder whose card ended up covering the couple's faces). Left in this folder for git history's sake and can be deleted if you'd like a smaller repo. |

`itin-venue.jpg`, `travel-hero.jpg`, `travel-map.png`, `faq-hero.jpg`, and
`registry-hero-old.jpg` were captured as rendered screenshots of the Figma
nodes (via the Figma MCP's `get_screenshot`) rather than original uploaded
source files, because this session's network policy doesn't allow outbound
requests to `figma.com` directly. Visually they match the design exactly;
if pixel-identical originals are ever wanted, download them from the
Figma file. `registry-hero.jpg` and `itin-hero.jpg` are real photos, not
Figma screenshots.

The remaining new-page images (`itin-dresscode-08.jpg`–`12.jpg`, all 6
`travel-hotel-*.jpg`, `travel-flights.jpg`,
`travel-seven-coloured-earths.jpg`) were provided directly by the couple
after hitting the Figma tool's rate limit, then resized/compressed the
same way as the rest of the site's photos.

`itin-dresscode-01.png`–`07.png` were later re-uploaded directly by the
couple as-is (raw PNG, uncompressed -- 226KB-745KB apiece, versus
20KB-65KB for `08.jpg`–`12.jpg` at the same on-page size). They render
correctly as-is, just heavier than this folder's usual convention; worth
converting to compressed JPEG later if repo size matters.

`travel-map.png` (the earlier raster base map) was replaced by
`travel-map.svg`, a clean vector silhouette the couple uploaded directly,
with no decorative pins baked in — the JS draws its own 13 markers on top
of it (`js/travel-map.js`). The old PNG is no longer referenced by any
page; it's left in this folder purely for git history's sake and can be
deleted if you'd like a smaller repo.

### Interactive map photos (Travel & Stay page)

`js/travel-map.js` points each of the map's 12 location popups at the
filename below. All 12 now have a real photo (the last 11 were provided
directly by the couple and resized/compressed to roughly the size they
display at, same convention as the rest of this folder).

| File | Location |
|---|---|
| `travel-map-venue.jpg` | La Grande Kaz (Wedding Venue) |
| `travel-map-airport.jpg` | SSR International Airport (MRU) |
| `travel-map-grand-baie.jpg` | Grand Baie |
| `travel-map-trou-aux-biches.jpg` | Trou aux Biches Beach |
| `travel-map-mont-choisy.jpg` | Mont Choisy Beach |
| `travel-map-pamplemousses.jpg` | Pamplemousses Botanical Garden |
| `travel-map-port-louis.jpg` | Port Louis |
| `travel-map-caudan.jpg` | Caudan Waterfront |
| `travel-map-tamarin.jpg` | Tamarin |
| `travel-map-black-river.jpg` | Black River Gorges National Park |
| `travel-map-le-morne.jpg` | Le Morne Brabant |
