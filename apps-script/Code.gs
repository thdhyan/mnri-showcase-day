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
      var rating = Number(p.rating);
      if (!p.poster || !p.name || !(rating >= 1 && rating <= 5)) return reply("invalid");
      append("Votes", [p.poster, p.title, p.presenter, p.name, rating]);
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
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(SHEETS[name]);
    sheet.setFrozenRows(1);
  }
  // Cells are stored as text values; a leading = + - @ is neutralised so a message cannot become a formula.
  var safe = cells.map(function (c) {
    return typeof c === "string" && /^[=+\-@]/.test(c) ? "'" + c : c;
  });
  sheet.appendRow([new Date()].concat(safe));
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
