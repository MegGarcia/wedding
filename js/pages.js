// Shared behavior for the new pages (Itinerary / Travel & Stay / FAQ /
// Registry / RSVP): mobile nav toggle and the FAQ accordion. Deliberately
// separate from js/main.js, which stays untouched. The auth-guard redirect
// itself lives inline in each page's <head> (see each .html file) rather
// than here, since it has to run synchronously before first paint.
(function () {
  'use strict';

  // ---------- Mobile nav toggle ----------
  var navToggle = document.getElementById('pagenav-toggle');
  var navMenu = document.getElementById('pagenav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = !navMenu.hidden;
      navMenu.hidden = isOpen;
      navToggle.setAttribute('aria-expanded', String(!isOpen));
    });
  }

  // ---------- FAQ accordion (no-op on pages without .faq-question) ----------
  var faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(function (button) {
    button.addEventListener('click', function () {
      var answerId = button.getAttribute('aria-controls');
      var answer = answerId ? document.getElementById(answerId) : null;
      if (!answer) return;

      var isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      answer.hidden = isOpen;
    });
  });

  // ---------- Registry placeholder link ----------
  // No real Zola registry exists yet -- see google-apps-script/README.md-
  // style provenance note in images/README.md and the plan this was built
  // from. Swap this constant for the real URL once you have one.
  var REGISTRY_URL = 'PASTE_YOUR_ZOLA_REGISTRY_URL_HERE';
  var registryLink = document.getElementById('registry-link');
  if (registryLink && REGISTRY_URL.indexOf('PASTE_YOUR_') !== 0) {
    registryLink.href = REGISTRY_URL;
    registryLink.removeAttribute('aria-disabled');
  }
})();
