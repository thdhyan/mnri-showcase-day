/**
 * MnRI Showcase Day: receives votes and questions/suggestions from the website
 * and appends them to a Google Sheet.
 * Setup: see README.md in this folder.
 */
var SPREADSHEET_ID = "1-ezuWR6rzrQ40mq7BLRDrpHvjJ3N15O5zQWPwoEar7Y";

var SHEETS = {
  Votes: ["Timestamp", "Poster", "Title", "Presenter", "Voter name", "Rating (1-5)"],
  Suggestions: ["Timestamp", "Type", "Name", "Email", "Message"],
};

function doPost(e) {
  var p = e.parameter;
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (p.sheet === "Votes") {
      // Batch: p.votes = JSON array of {poster,title,presenter,rating}, with p.name = voter. Single: p.poster/title/presenter/rating.
      var votes;
      try {
        votes = p.votes ? JSON.parse(p.votes) : [{ poster: p.poster, title: p.title, presenter: p.presenter, rating: p.rating }];
      } catch (err) {
        return reply("invalid");
      }
      if (!p.name || !votes.length || votes.length > 60) return reply("invalid");
      var rows = [];
      for (var i = 0; i < votes.length; i++) {
        var v = votes[i], r = Number(v.rating);
        if (!v.poster || !(r >= 1 && r <= 5)) return reply("invalid");  // all-or-nothing: nothing is saved
        rows.push([v.poster, v.title, v.presenter, p.name, r]);
      }
      appendMany("Votes", rows);
    } else if (p.sheet === "Suggestions") {
      if (!p.message) return reply("invalid");
      append("Suggestions", [p.kind, p.name, p.email, p.message]);
    } else {
      return reply("invalid");
    }
    return reply("ok");
  } finally {
    lock.releaseLock();
  }
}

function append(name, cells) {
  appendMany(name, [cells]);
}

/** Appends several rows in one write (all rows are saved together). */
function appendMany(name, rowsOfCells) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(SHEETS[name]);
    sheet.setFrozenRows(1);
  }
  // Cells are stored as text values; a leading = + - @ is neutralised so a message cannot become a formula.
  var now = new Date();
  var out = rowsOfCells.map(function (cells) {
    return [now].concat(cells.map(function (c) {
      return typeof c === "string" && /^[=+\-@]/.test(c) ? "'" + c : c;
    }));
  });
  sheet.getRange(sheet.getLastRow() + 1, 1, out.length, out[0].length).setValues(out);
}

function reply(status) {
  return ContentService.createTextOutput(status);
}

/** Run once from the editor: creates the Votes/Suggestions tabs and a per-poster Results tab. */
function setup() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Object.keys(SHEETS).forEach(function (n) {
    if (!ss.getSheetByName(n)) {
      var s = ss.insertSheet(n);
      s.appendRow(SHEETS[n]);
      s.setFrozenRows(1);
    }
  });
  var res = ss.getSheetByName("Results") || ss.insertSheet("Results");
  res.clear();
  res.getRange("A1").setFormula(
    '=QUERY(Votes!A:F,"select B, C, D, avg(F), count(F) where B is not null group by B, C, D order by avg(F) desc label B \'Poster\', C \'Title\', D \'Presenter\', avg(F) \'Average rating\', count(F) \'Votes\'",1)'
  );
}
