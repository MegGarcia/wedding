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
| `itin-dresscode-01.jpg` … `itin-dresscode-12.jpg` | Itinerary page dress-code inspiration grid |
| `itin-venue.jpg` | La Grande Kaz location map on the Itinerary page |
| `travel-hero.jpg` | Travel & Stay page hero photo |
| `travel-map.svg` | Base island silhouette for the interactive map on the Travel & Stay page |
| `travel-hotel-victoria-beachcomber.jpg` | Victoria Beachcomber hotel card |
| `travel-hotel-ravenala-attitude.jpg` | Ravenala Attitude hotel card |
| `travel-hotel-le-meridien.jpg` | Le Méridien hotel card |
| `travel-hotel-be-cosy.jpg` | Be Cosy by LOV hotel card |
| `travel-hotel-voile-bleue.jpg` | Voile Bleue Boutique hotel card |
| `travel-hotel-airbnb.jpg` | AirBnb card, Travel & Stay page |
| `travel-flights.jpg` | Flights section photo, Travel & Stay page |
| `travel-seven-coloured-earths.jpg` | "Seven Coloured Earths" callout card, Travel & Stay page |
| `faq-hero.jpg` | FAQ page hero photo |
| `registry-hero.jpg` | Registry page hero photo |

`itin-hero.jpg`, `itin-dresscode-01.jpg`–`07.jpg`, `itin-venue.jpg`,
`travel-hero.jpg`, `travel-map.png`, `faq-hero.jpg`, and `registry-hero.jpg`
were captured as rendered screenshots of the Figma nodes (via the Figma
MCP's `get_screenshot`) rather than original uploaded source files, because
this session's network policy doesn't allow outbound requests to
`figma.com` directly. Visually they match the design exactly; if pixel-
identical originals are ever wanted, download them from the Figma file.

The remaining new-page images (`itin-dresscode-08.jpg`–`12.jpg`, all 6
`travel-hotel-*.jpg`, `travel-flights.jpg`, `travel-seven-coloured-earths.jpg`)
were provided directly by the couple after hitting the Figma tool's rate
limit, then resized/compressed the same way as the rest of the site's
photos.

`travel-map.png` (the earlier raster base map) was replaced by
`travel-map.svg`, a clean vector silhouette the couple uploaded directly,
with no decorative pins baked in — the JS draws its own 13 markers on top
of it (`js/travel-map.js`). The old PNG is no longer referenced by any
page; it's left in this folder purely for git history's sake and can be
deleted if you'd like a smaller repo.

### Interactive map photos (Travel & Stay page)

`js/travel-map.js` already points each of the map's 13 location popups at
the exact filename below — drop a photo in under that name (same
resize/compress convention as everything else in this folder: JPEG,
roughly the size it displays at) and it appears automatically, no code
changes needed. Until a file exists, that popup shows the same "Photo
coming soon" placeholder used elsewhere on the site.

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
| `travel-map-chamarel.jpg` | Chamarel Seven Coloured Earths |
| `travel-map-black-river.jpg` | Black River Gorges National Park |
| `travel-map-le-morne.jpg` | Le Morne Brabant |
| `travel-map-ile-aux-cerfs.jpg` | Île aux Cerfs |
