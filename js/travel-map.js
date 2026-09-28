// Interactive Mauritius map on travel-stay.html. Self-contained: all 13
// locations, the lat/lng-to-map-position math, and the marker/popup
// interaction live in this one file. Kept separate from js/pages.js and
// js/rsvp.js the same way those are separate from each other -- this is
// the one file that owns the map widget. Base art is
// images/travel-map.svg (see that file's header comment in
// css/style.css for why the container needs its own background color).
(function () {
  'use strict';

  // Hover-capable pointer devices (mouse/trackpad) get the mouseenter/
  // mouseleave hover-to-open behavior. Touch-only devices rely solely on
  // tap (click) to open, and tap-elsewhere/Escape to close -- otherwise
  // legacy touch-to-mouse-event emulation can synthesize a mouseleave
  // shortly after the tap's click already opened the popup, closing it
  // ~150ms later ("ghost hover"), which is the intermittent open-then-
  // immediately-close bug reported on phones. (A touchscreen laptop whose
  // primary pointer is still a mouse/trackpad will report hover-capable
  // and keep this behavior even if the touchscreen itself is tapped
  // directly -- acceptable; phones are the target here.)
  var supportsHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Edit name/lat/lng/image directly. image points at the exact filename
  // to drop into images/ for that location's popup photo (see
  // images/README.md for the full list) -- until that file actually
  // exists, the <img>'s onerror handler below swaps in the diagonal-
  // stripe placeholder automatically, so there's nothing else to wire up
  // once real photos are supplied.
  var LOCATIONS = [
    { slug: 'venue', name: 'La Grande Kaz (Wedding Venue)', lat: -20.0825474, lng: 57.5468961, image: 'images/travel-map-venue.jpg' },
    { slug: 'airport', name: 'SSR International Airport (MRU)', lat: -20.4334615, lng: 57.6787266, image: 'images/travel-map-airport.jpg' },
    { slug: 'grand-baie', name: 'Grand Baie', lat: -20.0089204, lng: 57.5816352, image: 'images/travel-map-grand-baie.jpg' },
    { slug: 'trou-aux-biches', name: 'Trou aux Biches Beach', lat: -20.0350439, lng: 57.5449607, image: 'images/travel-map-trou-aux-biches.jpg' },
    { slug: 'mont-choisy', name: 'Mont Choisy Beach', lat: -20.0028549, lng: 57.5526127, image: 'images/travel-map-mont-choisy.jpg' },
    { slug: 'pamplemousses', name: 'Pamplemousses Botanical Garden', lat: -20.1045656, lng: 57.5803163, image: 'images/travel-map-pamplemousses.jpg' },
    { slug: 'port-louis', name: 'Port Louis', lat: -20.1608912, lng: 57.5012222, image: 'images/travel-map-port-louis.jpg' },
    { slug: 'caudan', name: 'Caudan Waterfront', lat: -20.160863, lng: 57.498089, image: 'images/travel-map-caudan.jpg' },
    { slug: 'tamarin', name: 'Tamarin', lat: -20.3377911, lng: 57.3750805, image: 'images/travel-map-tamarin.jpg' },
    { slug: 'chamarel', name: 'Chamarel Seven Coloured Earths', lat: -20.4400767, lng: 57.3731676, image: 'images/travel-seven-coloured-earths.jpg' },
    { slug: 'black-river', name: 'Black River Gorges National Park', lat: -20.4263719, lng: 57.4509443, image: 'images/travel-map-black-river.jpg' },
    { slug: 'le-morne', name: 'Le Morne Brabant', lat: -20.45, lng: 57.3166667, image: 'images/travel-map-le-morne.jpg' },
    { slug: 'ile-aux-cerfs', name: 'Île aux Cerfs', lat: -20.2723538, lng: 57.8041107, image: 'images/travel-map-ile-aux-cerfs.jpg' }
  ];

  // Mauritius is small enough (~60km across) that a flat linear
  // approximation -- lng as x, lat as y, one scale+offset per axis, no
  // real map projection -- places points accurately relative to each
  // other. These two reference points were measured directly against
  // the real vector geometry in images/travel-map.svg (the couple's own
  // upload, 471x540 viewBox), by parsing its path data and confirming
  // both points sit on the island polygon.
  var CALIBRATION = {
    refA: { name: 'Grand Baie', lat: -20.0089204, lng: 57.5816352, xPct: 61.57, yPct: 1.11 },
    refB: { name: 'Le Morne Brabant', lat: -20.45, lng: 57.3166667, xPct: 23.78, yPct: 96.67 }
  };

  function project(lat, lng) {
    var a = CALIBRATION.refA;
    var b = CALIBRATION.refB;
    var scaleX = (a.xPct - b.xPct) / (a.lng - b.lng);
    var scaleY = (a.yPct - b.yPct) / (a.lat - b.lat);
    return {
      xPct: (lng - b.lng) * scaleX + b.xPct,
      yPct: (lat - b.lat) * scaleY + b.yPct
    };
  }

  // Several of the 13 locations are genuinely close together in real life
  // (Port Louis/Caudan Waterfront are the same immediate area; the north
  // cluster around the venue spans only a few km) -- close enough that
  // their projected positions overlap at this map's small on-screen size,
  // making some of them un-tappable on a phone. These are small, purely
  // cosmetic percentage-point nudges applied on top of project()'s
  // geographic result so every marker stays independently tappable; they
  // do not change any lat/lng in LOCATIONS. Every resulting position below
  // was verified with a point-in-polygon test against the real vector path
  // in images/travel-map.svg (not eyeballed, and not a pixel-color guess
  // against a raster image like the old PNG-based values this replaces) --
  // re-verify the same way if the base SVG ever changes. Trou aux Biches,
  // Mont Choisy, and Grand Baie sit on a genuinely narrow stretch of the
  // island shape and end up closer together (~19-31px on mobile) than most
  // other markers; that's the real shape's limit at this size, not
  // something a further nudge fixes -- a marker-clustering UI would be the
  // proper fix if that's ever worth doing. Tamarin and Le Morne Brabant
  // need no nudge -- project()'s raw output already lands them cleanly on
  // the island.
  var NUDGES = {
    'venue': { dx: -3.54, dy: -0.39 },
    'airport': { dx: -3.66, dy: -1.98 },
    'grand-baie': { dx: 2.12, dy: 0.37 },
    'trou-aux-biches': { dx: -8.57, dy: 3.05 },
    'mont-choisy': { dx: -3.72, dy: 4.46 },
    'pamplemousses': { dx: 4.44, dy: -2.39 },
    'port-louis': { dx: -5.09, dy: -2.92 },
    'caudan': { dx: 5.97, dy: 2.64 },
    'chamarel': { dx: 1.07, dy: -1.00 },
    'black-river': { dx: 0.59, dy: -2.66 },
    'ile-aux-cerfs': { dx: -2.00, dy: -2.63 }
  };

  function projectWithNudge(loc) {
    var pos = project(loc.lat, loc.lng);
    var nudge = NUDGES[loc.slug];
    if (nudge) {
      pos.xPct += nudge.dx;
      pos.yPct += nudge.dy;
    }
    return pos;
  }

  var map = document.getElementById('travelmap');
  if (!map) return;

  var activeSlug = null;

  // Closing on mouseleave is deferred briefly and cancelled if the pointer
  // re-enters (the marker itself, or a spot the icon's own shape doesn't
  // quite cover) within that window -- without this, hovering near the
  // pin's center dot rapidly fires leave/enter and the popup flickers
  // open and closed.
  var closeTimer = null;

  function cancelClose() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  function markerId(slug) {
    return 'travelmap-marker-' + slug;
  }

  function popupId(slug) {
    return 'travelmap-popup-' + slug;
  }

  function createMarker(loc, pos) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'travelmap__marker';
    button.id = markerId(loc.slug);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', popupId(loc.slug));
    button.setAttribute('aria-label', loc.name);
    button.style.left = pos.xPct + '%';
    button.style.top = pos.yPct + '%';
    button.innerHTML =
      '<svg class="travelmap__marker-icon" viewBox="0 0 24 30" aria-hidden="true">' +
      '<path d="M12 0C5.4 0 0 5.2 0 11.6 0 19 12 30 12 30s12-11 12-18.4C24 5.2 18.6 0 12 0z"/>' +
      '<circle class="travelmap__marker-dot" cx="12" cy="11.6" r="4.4"/>' +
      '</svg>';

    if (supportsHover) {
      button.addEventListener('mouseenter', function () {
        cancelClose();
        openPopup(loc.slug);
      });
      button.addEventListener('mouseleave', function () {
        if (activeSlug !== loc.slug) return;
        cancelClose();
        closeTimer = setTimeout(function () {
          closeTimer = null;
          closePopup();
        }, 150);
      });
    }
    button.addEventListener('click', function (event) {
      // Without this, the click bubbles to the document listener below
      // and immediately closes the popup this same click just opened.
      event.stopPropagation();
      cancelClose();
      // Always open (never toggle-close here): on desktop, mouseenter
      // above already opens this marker's popup before its click ever
      // fires, so treating "already open" as "close" would make a plain
      // click right after a hover immediately close what the hover just
      // opened. Closing is mouseout / click elsewhere / Escape only, per
      // spec -- clicking a marker (including this one again) just
      // (re)shows its popup.
      openPopup(loc.slug);
    });

    return button;
  }

  function createPopup(loc, pos) {
    var popup = document.createElement('div');
    popup.className = 'travelmap__popup';
    popup.id = popupId(loc.slug);
    popup.setAttribute('role', 'group');
    popup.setAttribute('aria-labelledby', popupId(loc.slug) + '-title');
    popup.hidden = true;
    popup.style.left = pos.xPct + '%';
    popup.style.top = pos.yPct + '%';

    var photoWrap = document.createElement('div');
    photoWrap.className = 'travelmap__popup-photo';

    // The real photo file doesn't exist yet for most locations -- rather
    // than wait and re-wire this later, every location already points at
    // its intended filename (see images/README.md), and this 404s
    // gracefully into the same placeholder used elsewhere on the site
    // until that exact file is dropped into images/.
    var img = document.createElement('img');
    img.alt = '';
    img.addEventListener('error', function () {
      photoWrap.innerHTML = '<div class="placeholder-photo travelmap__popup-photo-placeholder">Photo coming soon</div>';
    });
    img.src = loc.image;
    photoWrap.appendChild(img);

    var title = document.createElement('p');
    title.className = 'travelmap__popup-title';
    title.id = popupId(loc.slug) + '-title';
    title.textContent = loc.name;

    popup.appendChild(photoWrap);
    popup.appendChild(title);

    return popup;
  }

  function openPopup(slug) {
    cancelClose();
    if (activeSlug === slug) return;
    closePopup();

    var marker = document.getElementById(markerId(slug));
    var popup = document.getElementById(popupId(slug));
    if (!marker || !popup) return;

    popup.hidden = false;
    marker.setAttribute('aria-expanded', 'true');
    marker.classList.add('is-active');
    activeSlug = slug;

    requestAnimationFrame(function () {
      popup.classList.add('is-open');
    });
  }

  function closePopup() {
    if (!activeSlug) return;

    var marker = document.getElementById(markerId(activeSlug));
    var popup = document.getElementById(popupId(activeSlug));

    if (marker) {
      marker.setAttribute('aria-expanded', 'false');
      marker.classList.remove('is-active');
    }
    if (popup) {
      popup.classList.remove('is-open');
      popup.hidden = true;
    }

    activeSlug = null;
  }

  document.addEventListener('click', function (event) {
    if (!activeSlug) return;
    if (map.contains(event.target)) return;
    cancelClose();
    closePopup();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape' || !activeSlug) return;
    var slug = activeSlug;
    cancelClose();
    closePopup();
    var marker = document.getElementById(markerId(slug));
    if (marker) marker.focus();
  });

  LOCATIONS.forEach(function (loc) {
    var pos = projectWithNudge(loc);
    map.appendChild(createMarker(loc, pos));
    map.appendChild(createPopup(loc, pos));
  });
})();
