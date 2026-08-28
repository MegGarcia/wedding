# Images

No real photos are included yet — the hero background, the itinerary circle
photo, and the three footer polaroids currently use CSS gradient
placeholders so the site renders without any external assets.

To swap in real photos:

- Hero background: replace the `background` on `.hero` in `css/style.css`
  with `background-image: url("../images/hero.jpg");` (keep the existing
  gradient overlay for text contrast).
- Itinerary circle: replace `.itinerary__photo`'s `background` with the
  couple's photo.
- Footer collage: replace each `.polaroid--1/2/3` background with a photo.
