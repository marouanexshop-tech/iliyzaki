/**
 * Receives orders from the site and appends one row per order.
 *
 * Install once:
 *   1. Open the sheet -> Extensions -> Apps Script
 *   2. Delete whatever is in Code.gs and paste this file
 *   3. Deploy -> New deployment -> type "Web app"
 *        Execute as:      Me
 *        Who has access:  Anyone
 *   4. Copy the /exec URL it gives you
 *   5. Put that URL in Vercel as GOOGLE_SHEET_WEBHOOK_URL, then redeploy
 *
 * "Anyone" is required because the site's server calls this without a Google
 * login. The URL itself is the only thing guarding it, so set SECRET below if
 * you would rather not rely on that alone.
 */

var SHEET_ID = '1w9so6uoc4FPKcCRAilNp-vztoGkHf2pvsryU_gvaa1M';

/** Tab to write into. Wrong or empty name falls back to the first tab. */
var SHEET_NAME = 'pack';

/**
 * Optional shared secret. Leave '' and any request is accepted. To turn it on,
 * put the same value here and in the site's GOOGLE_SHEET_WEBHOOK_SECRET.
 */
var SECRET = '';

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return reply({ ok: false, error: 'empty request' });
    }

    var body = JSON.parse(e.postData.contents);

    if (SECRET && body.secret !== SECRET) {
      return reply({ ok: false, error: 'bad secret' });
    }

    var row = body.row;
    if (!Array.isArray(row) || row.length === 0) {
      return reply({ ok: false, error: 'row missing' });
    }

    // Falling back to the first tab means a renamed tab loses the row's
    // placement, never the row itself.
    var book = SpreadsheetApp.openById(SHEET_ID);
    var sheet = (SHEET_NAME && book.getSheetByName(SHEET_NAME)) || book.getSheets()[0];

    sheet.appendRow(row);

    return reply({ ok: true, rows: sheet.getLastRow() });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

/** Lets you open the /exec URL in a browser to check the deployment is live. */
function doGet() {
  return reply({ ok: true, status: 'ready' });
}

function reply(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
