# Save the Date form → Google Sheet + email

The mailing-details form on the site (`#rsvp-form` in `index.html`) posts to a
Google Apps Script Web App, which appends each submission to a Google Sheet
and emails a notification. Since the site itself is static (no server), this
Web App has to be deployed once, by hand, from your Google account.

## One-time setup

1. **Create the Sheet.** Go to [sheet.new](https://sheet.new) and name it
   something like "Save the Date Submissions". You don't need to add any
   columns yourself — the script creates a `Submissions` tab with headers
   the first time it runs.

2. **Add the script.** In the Sheet, go to **Extensions → Apps Script**.
   Delete the placeholder `myFunction() {}` code and paste in the full
   contents of [`Code.gs`](./Code.gs) from this folder.

3. **Check the notify address.** `NOTIFY_EMAIL` at the top of `Code.gs` is
   already set to `megangarcia2024@gmail.com`. Change it there if you ever
   want notifications to go somewhere else.

4. **Deploy as a Web App.**
   - Click **Deploy → New deployment**.
   - Click the gear icon next to "Select type" and choose **Web app**.
   - Set **Execute as** to **Me**.
   - Set **Who has access** to **Anyone**.
   - Click **Deploy**, then authorize the requested Google account
     permissions (it needs access to the Sheet and to send email as you).
   - Copy the **Web app URL** it gives you — it looks like
     `https://script.google.com/macros/s/XXXXXXXX/exec`.

5. **Wire it into the site.** Open `js/main.js` and replace the
   `FORM_ENDPOINT` placeholder near the top of the mailing-details section
   with the URL you just copied:

   ```js
   var FORM_ENDPOINT = 'https://script.google.com/macros/s/XXXXXXXX/exec';
   ```

   Commit and push that change (or redeploy the site) and the form is live.

## Testing a change to Code.gs without redeploying

You don't need to redeploy the Web App (or touch the live form) just to
check that `appendSubmission` works correctly. In the Apps Script editor:

1. Make sure the latest `Code.gs` is pasted in and saved (Ctrl/Cmd+S).
2. In the function dropdown at the top of the editor, select
   `testAppendSubmission`.
3. Click **Run**. It calls `appendSubmission()` directly with fake data
   (postal code `08876`) — no HTTP request or deployment involved.
4. Check the `Submissions` tab: a "Test Zero" row should appear with the
   Postal Code and Phone columns keeping their leading zeros.

This is much faster than submitting the real form each time, and always
reflects whatever is currently saved in the editor, regardless of which
deployment version is live.

## After editing Code.gs later

Apps Script deployments are pinned to a version. If you change `Code.gs` in
the future, the live URL won't pick up the change automatically — go to
**Deploy → Manage deployments**, edit the existing deployment, and choose
**New version** before clicking **Deploy** again.

### Apt/Unit column added

The form now has a separate optional "Apartment, Suite, etc." field. Do the
redeploy above with the updated `Code.gs`. If your Sheet already has
submissions in it from before this change, the script won't rewrite its
header row automatically (it only writes headers the first time it creates
the tab) — manually insert a new column between "Street" and "City" and
label it "Apt/Unit" so old and new rows stay lined up.

## What it does

- Validates that the required fields (first/last name, street, city, state,
  postal code, email) are present.
- Appends a timestamped row to the `Submissions` tab.
- Sends an email to `NOTIFY_EMAIL` with the submitted details.
