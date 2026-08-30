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
  var sheet = getOrCreateSheet();
  sheet.appendRow([
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
  ]);
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
