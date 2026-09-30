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

  // ---------- Scroll reveal (mirrors js/main.js's site-wide pattern on
  // index.html exactly -- same .has-reveal gate class, [data-reveal]
  // selector, threshold, and reveal-once behavior -- so elements on
  // these 5 pages fade/slide in the same way the home page's do. The
  // CSS for this (.has-reveal [data-reveal], .reveal-d1/d2/d3) already
  // lives in the protected part of css/style.css, shared by every page,
  // so no CSS changes were needed here -- just observing the same
  // attribute.) ----------
  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (err) {
    reduceMotion = false;
  }

  if (!reduceMotion && window.IntersectionObserver) {
    document.documentElement.classList.add('has-reveal');

    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      revealObserver.observe(el);
    });
  }
})();
