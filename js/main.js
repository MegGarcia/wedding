(function () {
  'use strict';

  // ---------- Countdown ----------
  var WEDDING_DATE = new Date('2027-07-07T00:00:00');

  var daysEl = document.getElementById('cd-days');
  var hoursEl = document.getElementById('cd-hours');
  var minutesEl = document.getElementById('cd-minutes');
  var secondsEl = document.getElementById('cd-seconds');

  function pad(num, length) {
    var str = String(Math.max(num, 0));
    while (str.length < length) {
      str = '0' + str;
    }
    return str;
  }

  function updateCountdown() {
    var now = new Date();
    var diff = WEDDING_DATE.getTime() - now.getTime();

    if (diff <= 0) {
      daysEl.textContent = '000';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    daysEl.textContent = pad(days, 3);
    hoursEl.textContent = pad(hours, 2);
    minutesEl.textContent = pad(minutes, 2);
    secondsEl.textContent = pad(seconds, 2);
  }

  if (daysEl && hoursEl && minutesEl && secondsEl) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ---------- Mailing details form ----------
  var form = document.getElementById('rsvp-form');
  var success = document.getElementById('rsvp-success');

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // NOTE: No backend is wired up yet. Swap this block for a real
      // submission (e.g. Formspree, Netlify Forms, a serverless function)
      // once one is available.
      form.hidden = true;
      if (success) {
        success.hidden = false;
      }
    });
  }
})();
