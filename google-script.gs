/**
 * Google Apps Script for VKU Field Survey
 * 1. Open a Google Sheet.
 * 2. Extensions > Apps Script.
 * 3. Paste this code.
 * 4. Deploy > New Deployment > Web App.
 * 5. Set "Who has access" to "Anyone".
 * 6. Copy the Web App URL into app.js
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  // Create header row if empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "ID", "Timestamp", "Building", "Floor", "Room",
      "Category", "Rating", "Notes", "Photo Data URL"
    ]);
  }

  // Append survey data
  sheet.appendRow([
    data.id,
    data.timestamp,
    data.building,
    data.floor,
    data.room,
    data.category,
    data.rating,
    data.notes,
    data.photo
  ]);

  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}