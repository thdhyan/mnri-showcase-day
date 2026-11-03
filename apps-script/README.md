# Votes and feedback to Google Sheet

The website posts votes and questions/suggestions to a Google Apps Script web app, which writes them to the Google Sheet set in `Code.gs` (`SPREADSHEET_ID`).

1. Open https://script.google.com and create a new project. Paste in `Code.gs`.
2. Run `setup` once (authorise when asked). It creates the `Votes`, `Suggestions` and `Results` tabs.
3. Deploy > New deployment > type **Web app**. Execute as: **Me**. Who has access: **Anyone**. Copy the web app URL.
4. Put that URL in `SCRIPT_URL` in `../config.js`, commit and push.

After changing `Code.gs`, redeploy (Deploy > Manage deployments > edit > New version).

## Batched votes (multi-poster vote page)

`Code.gs` accepts either one vote (`poster`, `title`, `presenter`, `rating`, `name`) or a batch
(`name` + `votes` = JSON array of `{poster,title,presenter,rating}`). A batch is validated first and
written in one `setValues` call, so it is all-or-nothing. To turn it on:

1. Paste the updated `Code.gs` into the Apps Script project.
2. Deploy > Manage deployments > pencil on the existing web app > Version: New version > Deploy
   (the URL stays the same, so `config.js` `SCRIPT_URL` does not change).
3. Set `BATCH_VOTES: true` in `config.js` and push.
