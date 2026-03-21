# Google Sheets Setup Guide — NQSS 2026 Registration Portal (Updated)

## Step 1: Create Your Google Sheet
1. Create a new Google Sheet named `NQSS 2026 Registrations`.
2. In **Row 1**, add these headers exactly:
   `Timestamp | Full Name | Email | Gender | WhatsApp | Booking ID | Date of Birth | Institution | Group Name | Member 1 Name | Member 2 Name | Member 3 Name | Member 4 Name | Academic Category | Event Type | Track/Domain | Accommodation | EID URL | Ticket URL | Project Upload URL | EID Drive Link | Ticket Drive Link | Project Drive Link`

## Step 2: Open Apps Script
1. In your Sheet, click **Extensions → Apps Script**.
2. Delete all existing code and paste the following:

```javascript
function doPost(e) {
  try {
    // --- 1. SETTINGS: Grab both sheets ---
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet1 = ss.getSheetByName("Sheet1") || ss.getSheets()[0];
    var sheet2 = ss.getSheetByName("Sheet2") || ss.getSheets()[1]; // Second sheet for mirror copy

    // Replace with your Google Drive Folder ID from the URL
    var folderId = "1n6N6BH5f3U3XoUF-CQQyorpxpYVzJMM_";
    var folder = DriveApp.getFolderById(folderId);

    // --- 2. PARSE INCOMING DATA ---
    var data = JSON.parse(e.postData.contents);

    // --- 3. HELPER: Download file from Supabase and save to Drive ---
    function saveToDrive(url, prefix) {
      if (!url || !folder) return "";
      try {
        var response = UrlFetchApp.fetch(url);
        var blob = response.getBlob();
        var fileName = prefix + "_" + data.full_name + "_" + Date.now() + "_" + blob.getName();
        blob.setName(fileName);
        var file = folder.createFile(blob);
        return file.getUrl();
      } catch (f) {
        console.log("Drive Backup Failed for " + prefix + ": " + f.toString());
        return "Backup Error";
      }
    }

    // --- 4. BACKUP FILES FROM SUPABASE TO GOOGLE DRIVE ---
    var eidDriveUrl     = saveToDrive(data.eid_url, "EID");
    var ticketDriveUrl  = saveToDrive(data.ticket_url, "Ticket");
    var projectDriveUrl = saveToDrive(data.project_upload_url, "Project");

    // --- 5. BUILD THE ROW (same data for both sheets) ---
    var row = [
      new Date(),                       // Timestamp
      data.full_name        || "",
      data.email            || "",
      data.gender           || "",
      data.whatsapp         || "",
      data.booking_id       || "",
      data.date_of_birth    || "",
      data.institution      || "",
      data.group_name       || "",
      data.member_1_name    || "",
      data.member_2_name    || "",
      data.member_3_name    || "",
      data.member_4_name    || "",
      data.academic_category || "",
      data.event_type       || "",
      data.track_domain     || "",
      data.accommodation    || "",
      data.eid_url          || "",      // Supabase storage link
      data.ticket_url       || "",      // Supabase storage link
      data.project_upload_url || "",    // Supabase storage link
      eidDriveUrl,                      // Google Drive backup link
      ticketDriveUrl,                   // Google Drive backup link
      projectDriveUrl                   // Google Drive backup link
    ];

    // --- 6. SAVE TEXT BACKUP FILE TO GOOGLE DRIVE ---
    if (folder) {
      var backupName = "Backup_" + data.full_name + "_" + Date.now() + ".txt";
      var content =
        "FULL REGISTRATION BACKUP\n" +
        "==========================\n" +
        "Timestamp: "        + new Date()                         + "\n" +
        "Full Name: "        + (data.full_name        || "N/A")   + "\n" +
        "Email: "            + (data.email            || "N/A")   + "\n" +
        "Gender: "           + (data.gender           || "N/A")   + "\n" +
        "WhatsApp: "         + (data.whatsapp         || "N/A")   + "\n" +
        "Booking ID: "       + (data.booking_id       || "N/A")   + "\n" +
        "Date of Birth: "    + (data.date_of_birth    || "N/A")   + "\n" +
        "Institution: "      + (data.institution      || "N/A")   + "\n" +
        "Group Name: "       + (data.group_name       || "Individual") + "\n" +
        "Category: "         + (data.academic_category|| "N/A")   + "\n" +
        "Event: "            + (data.event_type       || "N/A")   + "\n" +
        "Track/Domain: "     + (data.track_domain     || "N/A")   + "\n" +
        "Accommodation: "    + (data.accommodation    || "N/A")   + "\n" +
        "--------------------------\n" +
        "SUPABASE LINKS:\n" +
        "EID:     "          + (data.eid_url           || "")      + "\n" +
        "Ticket:  "          + (data.ticket_url        || "")      + "\n" +
        "Project: "          + (data.project_upload_url|| "")      + "\n" +
        "--------------------------\n" +
        "DRIVE BACKUP LINKS:\n" +
        "EID:     "          + eidDriveUrl                         + "\n" +
        "Ticket:  "          + ticketDriveUrl                      + "\n" +
        "Project: "          + projectDriveUrl                     + "\n";
      folder.createFile(backupName, content);
    }

    // --- 7. WRITE SAME ROW TO BOTH SHEET1 AND SHEET2 ---
    sheet1.appendRow(row);
    if (sheet2) sheet2.appendRow(row); // Mirror copy to Sheet2

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    console.log("Error: " + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Step 3: Deploy as Web App
1. Click the blue **Deploy** button at the top right, then **New deployment**.
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**.
3. **Description**: `NQSS Portal Backend`
4. **Execute as**: `Me`
5. **Who has access**: `Anyone` (⚠️ **CRITICAL**: Do NOT select "Anyone with Google Account", it must be "Anyone" for the form to work)
6. Click **Deploy**.

## Step 4: Authorize the Script (MUST READ)
When you click deploy for the first time, Google will ask for permissions:
1. Click **Authorize access**.
2. Select your Google account.
3. **IMPORTANT:** You will see a warning screen saying "Google hasn't verified this app".
   - Click the **Advanced** link at the very bottom of the warning screen.
   - Click **"Go to Untitled project (unsafe)"** (it might say the name of your script).
4. Click **Allow** on the next screen.

## Step 5: Get the Web App URL
1. After authorization, the deployment will finish.
2. Copy the **Web App URL** shown on the final screen.

## Step 6: Paste URL into .env
Paste the copied URL into `.env`:
```
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

> **NOTE:** Every time you make changes to the Apps Script, you must create a **New Deployment** (not edit the existing one) to get an updated URL.

## Step 7: How to Debug if it Fails
If data shows up in Supabase but NOT in Google Sheets:
1. Open your Apps Script editor.
2. Click on **Executions** (clock icon on the left sidebar).
3. If you see "Completed" or "Failed" entries, the request is reaching Google.
4. If "Failed", click on it to see the error (e.g., "Script not found", "Permission denied").
5. If you see NO entries, the request is NOT reaching Google (check your `.env` URL).
