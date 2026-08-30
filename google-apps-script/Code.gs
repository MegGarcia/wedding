/**
 * Google Apps Script Web App backing the "Save the Date" mailing-details
 * form. Bind this script to the Google Sheet you want submissions written
 * to (Extensions -> Apps Script from within the Sheet), deploy it as a
 * Web App, and paste the deployment URL into FORM_ENDPOINT in js/main.js.
 *
 * See google-apps-script/README.md for full setup/deploy instructions.
 */

var NOTIFY_EMAIL = 'megangarcia2024@gmail.com';
var SHEET_NAME = 'Submissions';
var GUEST_SHEET_NAME = 'Guest List';
var GUEST_HEADER_ROW = ['First Name', 'Last Name', 'Phone'];

var REQUIRED_FIELDS = [
  'firstName',
  'lastName',
  'street',
  'city',
  'state',
  'postalCode',
  'email'
];

var HEADER_ROW = [
  'Timestamp',
  'First Name',
  'Last Name',
  'Street',
  'Apt/Unit',
  'City',
  'State',
  'Postal Code',
  'Email',
  'Phone'
];

var POSTAL_COLUMN = HEADER_ROW.indexOf('Postal Code') + 1;
var PHONE_COLUMN = HEADER_ROW.indexOf('Phone') + 1;

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var missing = REQUIRED_FIELDS.filter(function (field) {
      return !data[field];
    });
    if (missing.length) {
      return jsonResponse({ ok: false, error: 'Missing fields: ' + missing.join(', ') });
    }

    appendSubmission(data);
    sendNotificationEmail(data);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

/**
 * Login check for the site's phone-number gate. Uses JSONP (a real
 * callback invocation, not JSON) rather than relying on Apps Script
 * sending browser-readable CORS headers on a fetch response -- loading a
 * <script src> isn't subject to CORS at all, which sidesteps that
 * uncertainty entirely.
 */
function doGet(e) {
  var callback = e.parameter.callback;
  var result;
  try {
    result = checkGuestPhone(e.parameter.phone || '');
  } catch (err) {
    result = { ok: false, error: String(err) };
  }
  var body = callback + '(' + JSON.stringify(result) + ')';
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function checkGuestPhone(phone) {
  var normalized = normalizePhone(phone);
  if (!normalized) {
    return { ok: false };
  }

  var sheet = getOrCreateGuestSheet();
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    var rowPhone = normalizePhone(String(rows[i][2] || ''));
    if (rowPhone && rowPhone === normalized) {
      return { ok: true, firstName: String(rows[i][0] || ''), lastName: String(rows[i][1] || '') };
    }
  }
  return { ok: false };
}

function normalizePhone(value) {
  var digits = String(value).replace(/\D/g, '');
  // Compare the last 10 digits so a stored or entered leading "1" country
  // code doesn't cause a false mismatch.
  return digits.slice(-10);
}

function getOrCreateGuestSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(GUEST_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(GUEST_SHEET_NAME);
    sheet.appendRow(GUEST_HEADER_ROW);
  }
  return sheet;
}

function appendSubmission(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = getOrCreateSheet();
    var row = sheet.getLastRow() + 1;

    // Every column except Postal Code/Phone, written as one batch.
    sheet.getRange(row, 1, 1, HEADER_ROW.length).setValues([[
      new Date(),
      data.firstName,
      data.lastName,
      data.street,
      data.unit || '',
      data.city,
      data.state,
      '',
      data.email,
      ''
    ]]);

    // Postal Code and Phone are numeric-looking strings, and Sheets parses
    // those as actual numbers the same way it does when you type into a
    // cell -- silently dropping leading zeros (e.g. "08876" becoming 8876).
    // Pre-setting the cell's format and *then* writing the value as part of
    // a multi-column batch above still isn't reliable, since the batch
    // write re-triggers Sheets' automatic type detection across the row.
    // Chaining setNumberFormat('@') directly onto each cell's own
    // setValue() call is the pattern that actually holds.
    sheet.getRange(row, POSTAL_COLUMN).setNumberFormat('@').setValue(data.postalCode);
    sheet.getRange(row, PHONE_COLUMN).setNumberFormat('@').setValue(data.phone || '');
  } finally {
    lock.releaseLock();
  }
}

function getOrCreateSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADER_ROW);
  }
  return sheet;
}

function sendNotificationEmail(data) {
  var subject = 'New Save the Date submission — ' + data.firstName + ' ' + data.lastName;
  var body = [
    'A new mailing-details submission was received:',
    '',
    'Name: ' + data.firstName + ' ' + data.lastName,
    'Street: ' + data.street,
    'Apt/Unit: ' + (data.unit || '(none)'),
    'City: ' + data.city,
    'State: ' + data.state,
    'Postal Code: ' + data.postalCode,
    'Email: ' + data.email,
    'Phone: ' + (data.phone || '(not provided)')
  ].join('\n');

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Quick manual test: in the Apps Script editor, pick "testAppendSubmission"
 * from the function dropdown at the top and click Run. This calls
 * appendSubmission() directly with fake data (no HTTP request, no
 * redeploy needed -- just uses whatever code is currently saved), so it's
 * a much faster way to check the Postal Code/Phone columns keep their
 * leading zeros than doing a full form submission every time.
 */
function testAppendSubmission() {
  appendSubmission({
    firstName: 'Test',
    lastName: 'Zero',
    street: '123 Main St',
    unit: 'Apt 1',
    city: 'Anytown',
    state: 'NY',
    postalCode: '08876',
    email: 'test@example.com',
    phone: '0585551234'
  });
}

/**
 * Quick manual test for the login gate: add a real row to the "Guest
 * List" tab, then edit the phone number below to match it (in any
 * format -- digits, dashes, parens, it's normalized either way) and Run
 * this from the function dropdown. Logs whether it matched and, if so,
 * the first name it found -- no redeploy or real HTTP request needed.
 */
function testCheckGuestPhone() {
  var result = checkGuestPhone('555-123-4567');
  Logger.log(result);
}

/**
 * Proves the "1"/"+1" country-code case works regardless of which side
 * has it: pick any real row from the Guest List tab, and this checks it
 * against all four combinations (stored with/without a leading 1, entered
 * with/without one) -- normalizePhone() takes the *last 10 digits* of
 * both sides before comparing, so all four should log {ok: true, ...}
 * with the same firstName. Edit STORED_PHONE below to match a real row,
 * then Run from the function dropdown and check the log.
 */
function testCountryCodeMatching() {
  var STORED_PHONE = '555-123-4567'; // must match a real Guest List row, in whatever format that row uses

  var digitsOnly = STORED_PHONE.replace(/\D/g, '').slice(-10);
  var variants = [
    digitsOnly,             // no country code
    '1' + digitsOnly,       // leading 1, no plus
    '+1' + digitsOnly,      // leading +1
    '+1 (' + digitsOnly.slice(0, 3) + ') ' + digitsOnly.slice(3, 6) + '-' + digitsOnly.slice(6) // formatted with +1
  ];

  variants.forEach(function (variant) {
    Logger.log(variant + ' -> ' + JSON.stringify(checkGuestPhone(variant)));
  });
}
