# MnRI Showcase Day: Apps Script setup guide

Goal: make the **vote** page and the **questions & suggestions** page save to a Google Sheet. About 5 minutes. The script runs under the **personal Gmail account** (UMN accounts cannot run Apps Script web apps), and writes to the existing results sheet in the UMN Drive, which must be shared with that personal account as **Editor**.

## What it does

The website (GitHub Pages) cannot write to a Google Sheet by itself. A small Google Apps Script web app sits in between:

1. A visitor submits the vote form (`vote.html`) or the feedback form (`feedback.html`).
2. `forms.js` sends the answers to the web app URL stored in `config.js` (`SCRIPT_URL`).
3. `Code.gs` checks the answers and adds a row to the sheet.

| Tab | Filled by | Columns |
|---|---|---|
| `Votes` | vote page | Timestamp, Poster, Title, Presenter, Voter name, Rating (1-5) |
| `Suggestions` | feedback page | Timestamp, Type, Name, Email, Message |
| `Results` | formula (created by `setup`) | Poster, Title, Presenter, Average rating, Votes (best first) |

Target sheet: `1-ezuWR6rzrQ40mq7BLRDrpHvjJ3N15O5zQWPwoEar7Y` (set as `SPREADSHEET_ID` at the top of `Code.gs`).

## Steps (personal Google account)

0. **Share the sheet with the personal account.** Sign in to the UMN account, open the results sheet, click **Share**, add the personal Gmail address as **Editor**, and send. If UMN blocks sharing outside the university, use the fallback at the end of this guide.
1. **Create the project as the personal account.** Sign in to Google with the personal Gmail only (use an incognito window, or check the avatar at top right, so the UMN account is not used by mistake). Go to https://script.google.com, click **New project**. Delete the sample code and paste in the whole of `apps-script/Code.gs` from this repo. Click **Save**.
2. **Run `setup` once.** In the function drop-down choose `setup`, click **Run**. Google asks for permission (Review permissions > pick the personal account > a "Google hasn't verified this app" warning is normal for your own script > Advanced > Go to project > Allow). It creates the `Votes`, `Suggestions` and `Results` tabs in the sheet.
3. **Deploy as a web app.** Click **Deploy > New deployment**, gear icon > **Web app**. Set:
   - Execute as: **Me**
   - Who has access: **Anyone**

   Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).
4. **Give the URL to the site.** In `config.js` set `SCRIPT_URL` to that URL, then commit and push:

   ```js
   window.MNRI_CONFIG = {
     SCRIPT_URL: "https://script.google.com/macros/s/XXXX/exec",
     SITE_URL: "https://thdhyan.github.io/mnri-showcase-day/"
   };
   ```

   Or send the URL to Claude and it will do this step.
5. **Test.** Open https://thdhyan.github.io/mnri-showcase-day/vote.html?poster=1-164-01, enter a name, pick a rating, submit. A new row should appear in the `Votes` tab within a few seconds. Delete the test row before the event. Do the same on `feedback.html`.

## If the UMN sheet cannot be shared with the personal account

Create a new blank Google Sheet in the personal Drive, copy its ID from the URL (the text between `/d/` and `/edit`), put it in `SPREADSHEET_ID` in `Code.gs`, and re-run `setup`. Share that sheet with the organizers at their UMN emails so they can read results. After the event, download the sheet as xlsx or CSV for the department's records.

## Notes

- The script runs as the personal account. Visitors never sign in, and the site works the same regardless of which account owns the script.

- The form posts in "no-cors" mode, so the page always shows "thanks" even if the script rejects the data. The sheet is the only proof. Always test once.
- Invalid votes (missing poster or name, rating outside 1-5) are dropped.
- A value starting with `=`, `+`, `-` or `@` is stored with a leading apostrophe so nobody can inject a spreadsheet formula.
- "Anyone" access only lets people send data to the script. It does not expose the sheet.
- One person can vote more than once. The sheet records names, so remove duplicates by hand if needed.
- After editing `Code.gs`: **Deploy > Manage deployments > pencil icon > Version: New version > Deploy**. The URL stays the same.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Page says "This form is not connected yet" | `SCRIPT_URL` in `config.js` is empty; do step 4 and push. |
| No row appears | Deployment access is not **Anyone**, or an old version is deployed. Redeploy a new version. |
| `Exception: You do not have permission` in the editor | Re-run `setup` and approve the permissions. |
| `Exception: Requested entity was not found` / `You do not have permission to access the requested document` | The sheet is not shared with the personal account as **Editor**, or `SPREADSHEET_ID` is wrong. |
| `Results` tab is empty | No votes yet, or `Votes` tab was renamed. |
