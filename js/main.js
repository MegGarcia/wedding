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
  // Submissions are sent to a Google Apps Script Web App, which appends a
  // row to a Google Sheet and emails a notification. See
  // google-apps-script/README.md for how to deploy it and get this URL.
  var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwQHIr54WCNY5Ob7V0-vccMO19n0XGzK7B3vNrgLEtCNdCXUS-wlZmZJjm_ImABha2xTg/exec';

  var form = document.getElementById('rsvp-form');
  var success = document.getElementById('rsvp-success');

  function showSuccess() {
    form.hidden = true;
    if (success) {
      success.hidden = false;
    }
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (FORM_ENDPOINT.indexOf('PASTE_YOUR_') === 0) {
        console.warn('FORM_ENDPOINT is not configured yet — see google-apps-script/README.md');
        showSuccess();
        return;
      }

      var data = {};
      new FormData(form).forEach(function (value, key) {
        data[key] = value;
      });

      // Apps Script Web Apps don't return CORS headers browsers can read,
      // so the response is opaque either way — fire the request and show
      // success once it's been sent.
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
      }).then(showSuccess).catch(showSuccess);
    });
  }
})();
