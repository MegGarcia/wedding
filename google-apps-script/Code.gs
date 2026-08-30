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

function appendSubmission(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = getOrCreateSheet();
    var row = sheet.getLastRow() + 1;

    // Format these columns as plain text *before* writing the value.
    // Sheets auto-parses numeric-looking strings the same way it does
    // when you type into a cell, so a plain string write (or even a
    // leading-apostrophe string) still gets silently converted to a
    // number and loses leading zeros (e.g. postal code "08876" becoming
    // 8876). Pre-formatting the cell as text is the only reliable fix.
    sheet.getRange(row, POSTAL_COLUMN).setNumberFormat('@');
    sheet.getRange(row, PHONE_COLUMN).setNumberFormat('@');

    sheet.getRange(row, 1, 1, HEADER_ROW.length).setValues([[
      new Date(),
      data.firstName,
      data.lastName,
      data.street,
      data.unit || '',
      data.city,
      data.state,
      data.postalCode,
      data.email,
      data.phone || ''
    ]]);
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
