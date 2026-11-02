# Votes and feedback to Google Sheet

The website posts votes and questions/suggestions to a Google Apps Script web app, which writes them to the Google Sheet set in `Code.gs` (`SPREADSHEET_ID`).

1. Open https://script.google.com and create a new project. Paste in `Code.gs`.
2. Run `setup` once (authorise when asked). It creates the `Votes`, `Suggestions` and `Results` tabs.
3. Deploy > New deployment > type **Web app**. Execute as: **Me**. Who has access: **Anyone**. Copy the web app URL.
4. Put that URL in `SCRIPT_URL` in `../config.js`, commit and push.

After changing `Code.gs`, redeploy (Deploy > Manage deployments > edit > New version).
