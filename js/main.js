(function () {
  'use strict';

  // Shared with both the login gate and the mailing-details form below.
  // Submissions/logins go through a Google Apps Script Web App bound to a
  // Google Sheet. See google-apps-script/README.md for how to deploy it
  // and get this URL.
  var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyvorsLrGa4UJ2-93LDJByizdq8MJ5Uc1i7unDinzjZ9BxevgBvwtvvFycO_VDH6yUxrA/exec';

  // ---------- Login gate ----------
  var AUTH_STORAGE_KEY = 'weddingSiteAuthed';

  var loginGate = document.getElementById('login-gate');
  var siteContent = document.getElementById('site-content');
  var loginForm = document.getElementById('login-form');
  var loginPhone = document.getElementById('login-phone');
  var loginError = document.getElementById('login-error');
  var loginSubmit = loginForm ? loginForm.querySelector('.login-gate__submit') : null;

  function revealSite() {
    if (loginGate) {
      loginGate.hidden = true;
    }
    if (siteContent) {
      siteContent.hidden = false;
    }
  }

  var alreadyAuthed = false;
  try {
    alreadyAuthed = localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  } catch (err) {
    // localStorage unavailable (private browsing, etc.) -- fail closed,
    // the login gate stays up.
  }

  if (alreadyAuthed) {
    revealSite();
  } else if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!loginPhone.value.trim()) {
        loginPhone.focus();
        return;
      }

      loginError.hidden = true;
      loginSubmit.disabled = true;

      var callbackName = 'weddingLoginCallback_' + Date.now();
      var script = document.createElement('script');

      function cleanup() {
        clearTimeout(timeoutId);
        delete window[callbackName];
        script.remove();
        loginSubmit.disabled = false;
      }

      function showLoginError() {
        loginError.hidden = false;
        loginPhone.focus();
      }

      var timeoutId = setTimeout(function () {
        cleanup();
        showLoginError();
      }, 10000);

      window[callbackName] = function (result) {
        cleanup();
        if (result && result.ok) {
          try {
            localStorage.setItem(AUTH_STORAGE_KEY, 'true');
          } catch (err) {
            // Nothing to do -- worst case, they log in again next visit.
          }
          revealSite();
        } else {
          showLoginError();
        }
      };

      script.onerror = function () {
        cleanup();
        showLoginError();
      };
      script.src = FORM_ENDPOINT + '?phone=' + encodeURIComponent(loginPhone.value) + '&callback=' + callbackName;
      document.body.appendChild(script);
    });
  }

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
  var submitButton = form ? form.querySelector('.rsvp__submit') : null;

  var FIELD_MESSAGES = {
    email: { typeMismatch: 'Enter a valid email address.' },
    postal: { patternMismatch: 'Enter a valid ZIP code (e.g. 12345 or 12345-6789).' },
    phone: { patternMismatch: 'Enter a valid phone number.' }
  };

  function messageFor(field) {
    var validity = field.validity;
    var overrides = FIELD_MESSAGES[field.id] || {};

    if (validity.valueMissing) {
      return 'This field is required.';
    }
    if (validity.typeMismatch) {
      return overrides.typeMismatch || 'Enter a valid value.';
    }
    if (validity.patternMismatch) {
      return overrides.patternMismatch || 'Enter a valid value.';
    }
    return field.validationMessage || 'Enter a valid value.';
  }

  function validateField(field) {
    var errorEl = field.nextElementSibling;
    var hasErrorEl = errorEl && errorEl.classList.contains('field__error');

    if (field.checkValidity()) {
      field.classList.remove('is-invalid');
      field.removeAttribute('aria-invalid');
      if (hasErrorEl) {
        errorEl.remove();
      }
      return true;
    }

    field.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');

    if (!hasErrorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'field__error';
      errorEl.id = field.id + '-error';
      field.insertAdjacentElement('afterend', errorEl);
    }
    errorEl.textContent = messageFor(field);
    field.setAttribute('aria-describedby', errorEl.id);

    return false;
  }

  function showSuccess() {
    if (submitButton) {
      submitButton.disabled = false;
    }
    form.hidden = true;
    if (success) {
      success.hidden = false;
    }
  }

  if (form) {
    var fields = form.querySelectorAll('input, select');
    fields.forEach(function (field) {
      field.addEventListener('input', function () {
        validateField(field);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var firstInvalid = null;
      fields.forEach(function (field) {
        var valid = validateField(field);
        if (!valid && !firstInvalid) {
          firstInvalid = field;
        }
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
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
