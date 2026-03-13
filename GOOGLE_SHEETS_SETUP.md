# Google Sheets Setup Guide — NQSS 2026 Registration Portal (Updated)

## Step 1: Create Your Google Sheet
1. Create a new Google Sheet named `NQSS 2026 Registrations`.
2. In **Row 1**, add these headers exactly:
   `Timestamp | Full Name | Email | WhatsApp | Date of Birth | Institution | Group Name | Member 1 Name | Member 2 Name | Member 3 Name | Member 4 Name | Academic Category | Event Type | Track/Domain | Accommodation | EID URL | Ticket URL | Project Upload URL`

## Step 2: Open Apps Script
1. In your Sheet, click **Extensions → Apps Script**.
2. Delete all existing code and paste the following:

```javascript
function doPost(e) {
  try {
    // 1. Get the sheet by name (prevents appending to wrong tab)
    // Make sure your tab is named "Sheet1" or change this name
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1") || 
                SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    
    // 2. Log arrival (check "Executions" tab to see this)
    console.log("Request received: " + e.postData.contents);
    
    var data = JSON.parse(e.postData.contents);

    // 3. Append the row
    sheet.appendRow([
      new Date(),
      data.full_name || "",
      data.email || "",
      data.whatsapp || "",
      data.date_of_birth || "",
      data.institution || "",
      data.group_name || "",
      data.member_1_name || "",
      data.member_2_name || "",
      data.member_3_name || "",
      data.member_4_name || "",
      data.academic_category || "",
      data.event_type || "",
      data.track_domain || "",
      data.accommodation || "",
      data.eid_url || "",
      data.ticket_url || "",
      data.project_upload_url || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    console.log("Error: " + err.toString()); // This will show why it failed in Executions
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
