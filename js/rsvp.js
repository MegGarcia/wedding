// RSVP (attendance) form on rsvp.html. Modeled on -- but not shared with --
// the mailing-details form handler in js/main.js (that file stays
// untouched); replicates the same validation/fetch pattern for this
// separate form and separate Code.gs path (formType: 'rsvp').
(function () {
  'use strict';

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (err) {
    reduceMotion = false;
  }

  // Same deployed Apps Script Web App URL as js/main.js's FORM_ENDPOINT --
  // duplicated here since there's no shared module to import it from.
  var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbykXicuZau62KHgfccEqbTAd5o2z8IEIKjvkzpVXr5vRkePNalIUnZ0UPtsChL2O5y-lg/exec';

  var form = document.getElementById('rsvp-attend-form');
  if (!form) return;

  var success = document.getElementById('rsvp-attend-success');
  var submitButton = form.querySelector('.rsvp__submit');
  var plusOneYes = document.getElementById('rsvp-plusone-yes');
  var plusOneNo = document.getElementById('rsvp-plusone-no');
  var plusOneName = document.getElementById('rsvp-plusone-name');
  var plusOneNameWrap = document.getElementById('rsvp-plusone-name-wrap');
  var attendingRadios = form.querySelectorAll('input[name="attending"]');
  var followup = document.getElementById('rsvp-followup');

  // ---------- Plus-one name field: only shown/enabled/required once "Yes" is picked ----------
  function syncPlusOneName() {
    if (!plusOneName) return;
    var enabled = !!(plusOneYes && plusOneYes.checked);
    plusOneName.disabled = !enabled;
    if (plusOneNameWrap) plusOneNameWrap.hidden = !enabled;
    if (!enabled) {
      plusOneName.value = '';
      plusOneName.classList.remove('is-invalid');
      var errorEl = plusOneName.nextElementSibling;
      if (errorEl && errorEl.classList.contains('field__error')) {
        errorEl.remove();
      }
    }
  }

  if (plusOneYes) plusOneYes.addEventListener('change', syncPlusOneName);
  if (plusOneNo) plusOneNo.addEventListener('change', syncPlusOneName);
  syncPlusOneName();

  // ---------- Everything after "Will you be attending?": only shown once
  // "Joyfully accept" is picked -- "Regretfully decline" (or nothing yet)
  // keeps the default of showing none of it. Answers already given to the
  // hidden questions are cleared, since FormData still submits a checked/
  // filled-in value regardless of its container's visibility. ----------
  function syncAttendingFollowup() {
    if (!followup) return;
    var checked = form.querySelector('input[name="attending"]:checked');
    var show = !!(checked && checked.value === 'Joyfully accept');
    followup.hidden = !show;

    var plusOneRadios = form.querySelectorAll('input[name="plusOne"]');
    Array.prototype.forEach.call(plusOneRadios, function (radio) {
      radio.required = show;
      if (!show) radio.checked = false;
    });

    if (!show) {
      Array.prototype.forEach.call(form.querySelectorAll('input[name="events"]'), function (box) {
        box.checked = false;
      });
      ['rsvp-dietary', 'rsvp-songs', 'rsvp-notes'].forEach(function (id) {
        var field = document.getElementById(id);
        if (field) field.value = '';
      });
      syncPlusOneName();
    }
  }

  Array.prototype.forEach.call(attendingRadios, function (radio) {
    radio.addEventListener('change', syncAttendingFollowup);
  });
  syncAttendingFollowup();

  // ---------- Validation (mirrors js/main.js's validateField/messageFor pattern) ----------
  function messageFor(field) {
    var validity = field.validity;
    if (validity.valueMissing) {
      return 'This field is required.';
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

  function validateRadioGroup(name) {
    var radios = form.querySelectorAll('input[name="' + name + '"]');
    return Array.prototype.some.call(radios, function (radio) {
      return radio.checked;
    });
  }

  function validateCheckboxGroup(name) {
    var boxes = form.querySelectorAll('input[name="' + name + '"]');
    return Array.prototype.some.call(boxes, function (box) {
      return box.checked;
    });
  }

  function showSuccess() {
    if (submitButton) {
      submitButton.disabled = false;
    }

    function finish() {
      form.hidden = true;
      if (success) {
        success.hidden = false;
        if (!reduceMotion) {
          requestAnimationFrame(function () {
            success.classList.add('is-visible');
          });
        }
      }
    }

    if (reduceMotion) {
      finish();
      return;
    }

    form.classList.add('rsvp__form--sending-out');
    form.addEventListener('transitionend', function onFormOut(event) {
      if (event.target !== form) return;
      form.removeEventListener('transitionend', onFormOut);
      finish();
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var valid = true;

    var textFields = form.querySelectorAll('input[type="text"]:not(:disabled)');
    textFields.forEach(function (field) {
      if (field.hasAttribute('required') && !validateField(field)) {
        valid = false;
      }
    });

    if (!validateRadioGroup('attending')) valid = false;
    if (followup && !followup.hidden) {
      if (!validateRadioGroup('plusOne')) valid = false;
      if (!validateCheckboxGroup('events')) valid = false;
    }

    var nameField = document.getElementById('rsvp-name');
    if (nameField && !validateField(nameField)) valid = false;

    if (!valid) {
      var firstInvalid = form.querySelector('.is-invalid, input:invalid:not(:disabled)');
      if (firstInvalid) firstInvalid.focus();
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

    var data = { formType: 'rsvp' };
    new FormData(form).forEach(function (value, key) {
      if (key === 'events') {
        data.events = data.events || [];
        data.events.push(value);
      } else {
        data[key] = value;
      }
    });
    data.events = data.events || [];

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    }).then(showSuccess).catch(showSuccess);
  });
})();
