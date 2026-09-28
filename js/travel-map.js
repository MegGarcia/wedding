// Interactive Mauritius map on travel-stay.html. Self-contained: all 13
// locations, the lat/lng-to-map-position math, and the marker/popup
// interaction live in this one file. Kept separate from js/pages.js and
// js/rsvp.js the same way those are separate from each other -- this is
// the one file that owns the map widget.
(function () {
  'use strict';

  // Edit name/lat/lng/image directly. Leave image '' to show the
  // diagonal-stripe placeholder; paste a real images/... path once a
  // real photo is supplied and it swaps in automatically.
  var LOCATIONS = [
    { slug: 'venue', name: 'La Grande Kaz (Wedding Venue)', lat: -20.0825474, lng: 57.5468961, image: '' },
    { slug: 'airport', name: 'SSR International Airport (MRU)', lat: -20.4334615, lng: 57.6787266, image: '' },
    { slug: 'grand-baie', name: 'Grand Baie', lat: -20.0089204, lng: 57.5816352, image: '' },
    { slug: 'trou-aux-biches', name: 'Trou aux Biches Beach', lat: -20.0350439, lng: 57.5449607, image: '' },
    { slug: 'mont-choisy', name: 'Mont Choisy Beach', lat: -20.0028549, lng: 57.5526127, image: '' },
    { slug: 'pamplemousses', name: 'Pamplemousses Botanical Garden', lat: -20.1045656, lng: 57.5803163, image: '' },
    { slug: 'port-louis', name: 'Port Louis', lat: -20.1608912, lng: 57.5012222, image: '' },
    { slug: 'caudan', name: 'Caudan Waterfront', lat: -20.160863, lng: 57.498089, image: '' },
    { slug: 'tamarin', name: 'Tamarin', lat: -20.3377911, lng: 57.3750805, image: '' },
    { slug: 'chamarel', name: 'Chamarel Seven Coloured Earths', lat: -20.4400767, lng: 57.3731676, image: '' },
    { slug: 'black-river', name: 'Black River Gorges National Park', lat: -20.4263719, lng: 57.4509443, image: '' },
    { slug: 'le-morne', name: 'Le Morne Brabant', lat: -20.45, lng: 57.3166667, image: '' },
    { slug: 'ile-aux-cerfs', name: 'Île aux Cerfs', lat: -20.2723538, lng: 57.8041107, image: '' }
  ];

  // Mauritius is small enough (~60km across) that a flat linear
  // approximation -- lng as x, lat as y, one scale+offset per axis, no
  // real map projection -- places points accurately relative to each
  // other. These two reference points were estimated by eye against
  // images/travel-map.png (the only art available -- Figma access is
  // rate-limited this session, see images/README.md). Re-derive both
  // once the real vector map is reachable; nothing else here should
  // need to change.
  var CALIBRATION = {
    refA: { name: 'Grand Baie', lat: -20.0089204, lng: 57.5816352, xPct: 56, yPct: 6 },
    refB: { name: 'Le Morne Brabant', lat: -20.45, lng: 57.3166667, xPct: 8, yPct: 88 }
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
  // do not change any lat/lng in LOCATIONS. Revisit alongside the
  // calibration once the real Figma map is reachable.
  var NUDGES = {
    'venue': { dx: -2.7, dy: 3.3 },
    'grand-baie': { dx: 4, dy: -1 },
    'trou-aux-biches': { dx: -5.4, dy: 2.2 },
    'mont-choisy': { dx: -2.75, dy: -1.9 },
    'pamplemousses': { dx: 3.2, dy: 2.2 },
    'port-louis': { dx: -2, dy: -6 },
    'caudan': { dx: 2, dy: 6 }
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

    button.addEventListener('mouseenter', function () {
      openPopup(loc.slug);
    });
    button.addEventListener('mouseleave', function () {
      if (activeSlug === loc.slug) closePopup();
    });
    button.addEventListener('click', function (event) {
      // Without this, the click bubbles to the document listener below
      // and immediately closes the popup this same click just opened.
      event.stopPropagation();
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

    var photoHtml = loc.image
      ? '<img src="' + loc.image + '" alt="">'
      : '<div class="placeholder-photo travelmap__popup-photo-placeholder">Photo coming soon</div>';

    popup.innerHTML =
      '<div class="travelmap__popup-photo">' + photoHtml + '</div>' +
      '<p class="travelmap__popup-title" id="' + popupId(loc.slug) + '-title">' + loc.name + '</p>';

    return popup;
  }

  function openPopup(slug) {
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
      positionWithinBounds(popup);
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
      popup.classList.remove('is-open', 'travelmap__popup--flip-left', 'travelmap__popup--flip-right', 'travelmap__popup--flip-top');
      popup.hidden = true;
    }

    activeSlug = null;
  }

  function positionWithinBounds(popup) {
    var mapRect = map.getBoundingClientRect();
    var popupRect = popup.getBoundingClientRect();

    popup.classList.remove('travelmap__popup--flip-left', 'travelmap__popup--flip-right', 'travelmap__popup--flip-top');

    if (popupRect.left < mapRect.left) {
      popup.classList.add('travelmap__popup--flip-left');
    } else if (popupRect.right > mapRect.right) {
      popup.classList.add('travelmap__popup--flip-right');
    }

    if (popup.getBoundingClientRect().top < mapRect.top) {
      popup.classList.add('travelmap__popup--flip-top');
    }
  }

  document.addEventListener('click', function (event) {
    if (!activeSlug) return;
    if (map.contains(event.target)) return;
    closePopup();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape' || !activeSlug) return;
    var slug = activeSlug;
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
