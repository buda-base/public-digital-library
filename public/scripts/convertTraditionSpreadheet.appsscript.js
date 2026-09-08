/*
 * Apps Script bound to the Traditions spreadsheet. It produces `traditions.json`,
 * the file that drives the Tibetan tradition page (src/components/TraditionViewer.js,
 * loaded through src/lib/api.js).
 *
 * ---------------------------------------------------------------------------
 * What it generates, and what it does NOT
 * ---------------------------------------------------------------------------
 * `startConversionThenDownloadResultsJSON()` is the entry point. It:
 *   1. runs `processSheetData()` — one sheet per school (see `sheetMapping`),
 *      each turned into { id: "bdr:Tradition…", classes, content: [ category →
 *      the work ids under it ] };
 *   2. downloads a FRESH copy of `traditions-base.json` from GitHub, branch
 *      `feature-living-library-route` (see the `url` below) — a branch, not the
 *      working copy;
 *   3. assigns the sheet output to ONE path of that document:
 *
 *          jsonData.tradition.bo.subContent.selected
 *
 *   4. writes the whole thing to Drive as `traditions.json`, which then gets
 *      copied over `public/traditions.json` in this repo.
 *
 * The columns `processSheetData()` reads, per row: A = the category label (en) and
 * the marker of a category row, B = the bo label (the category's on a category row,
 * the work's on a work row), C = the work RID, D = the cell whose presence marks a
 * work row, E = the author — optional, and emitted only when the cell is non-empty,
 * as `author: [{ lang: "bo", value }]` on the work entry. Nothing reads `author`
 * yet: TraditionViewer renders a card's `label` and `kind` only.
 *
 * So the generated region is `tradition.bo.subContent.selected` and nothing
 * else. Every other part of `traditions.json` — the links row, the `all` /
 * `persons` / `places` sections, `subContent.texts`, `subContent.persons`,
 * `subContent.places`, and the `sa` / `zh` locales — is whatever
 * `traditions-base.json` on that branch happens to contain at run time.
 *
 * Consequence, and the reason this note exists: hand-editing
 * `public/traditions.json` outside `subContent.selected` is silently undone by
 * the next run of this script, because step 2 re-downloads the base. Such edits
 * belong in `public/traditions-base.json`.
 *
 * And since the base comes from a branch, an edit sitting only in a working copy
 * is invisible here: it has to be pushed to the branch the `url` names.
 *
 * The URL pointed at `new-UX` until 2026-09-01. That branch was merged into
 * master (48d7cd6, 2025-05-19) and has had no commit since, so it would have
 * frozen the base while master moved on; the file was byte-identical on both at
 * the time of the switch (last touched by 5c9101b6, 2025-01-27), so repointing
 * to master changed nothing in the output.
 *
 * It moved again on 2026-09-07, to `feature-living-library-route`: the `kind`
 * markers below live there and nowhere else, so master would drop them. Move the
 * URL back to master once that branch is merged.
 *
 *   change wanted                                  | edit
 *   -----------------------------------------------|-------------------------------
 *   category/work lists under a school             | the spreadsheet, then re-run
 *   a school's bdr: URI or json key                | `sheetMapping` below
 *   anything else in the document                  | `traditions-base.json`, on the branch the `url` names
 *
 * ---------------------------------------------------------------------------
 * The authors this script does NOT write: `authorBatch`
 * ---------------------------------------------------------------------------
 * Column E leaves some 420 of the 1662 works without an author.
 * ../../tools/fill_authors.py reads the creator of the work behind those instances out
 * of BDRC's own data and writes it as `authorBatch` — a field of its own, never mixed
 * with column E's `author`, which always wins where both exist (TraditionViewer reads
 * `author ?? authorBatch`).
 *
 * Because step 3 below rebuilds `subContent.selected` from the sheet, an `authorBatch`
 * does not survive a run of this script: re-run that tool afterwards (its cache makes
 * the second run a matter of seconds), or paste the names it lists in
 * tools/authors-from-rdf.csv into column E, which is where they belong for good.
 *
 * ---------------------------------------------------------------------------
 * Worked example: the `kind` markers (2026-09-01)
 * ---------------------------------------------------------------------------
 * `TraditionViewer` gained a second line on its cards, fed by a `"kind"` key —
 * "Derge Kangyur", "Editions", "Places"… Twelve `kind` markers were added by
 * hand to `public/traditions.json`: eight under `tradition.bo.content[…]` (the
 * links row entries, plus the `all`, `persons` and `places` sections) and four
 * under `tradition.bo.subContent.places.*`. None of them sit inside
 * `subContent.selected`, so all twelve came from the base file and all twelve
 * would have been dropped on the next run. They now live in
 * `public/traditions-base.json` as well, committed and pushed to
 * `feature-living-library-route` (d3d6f97a) — which is why the `url` below names
 * that branch rather than master.
 *
 * Note that the sheet-generated categories need no `kind` of their own:
 *   - a card falls back to its section's kind (`c.kind ?? t.kind`,
 *     TraditionViewer.js around line 262), and
 *   - a generated category renders through `renderContent`'s `groups` branch,
 *     whose second line is the "n texts" count, not the kind label.
 * If a `kind` is ever wanted on them, it has to be emitted here — on
 * `sheetResults` for a whole school, or on `currentItem` per category.
 *
 * ---------------------------------------------------------------------------
 * Caveats when running
 * ---------------------------------------------------------------------------
 *   - A sheet missing from `sheetMapping` throws: the fallback
 *     `"tmp:tradi" + id` reads an `id` that is never declared. Add the sheet to
 *     the mapping before running.
 *   - `DriveApp.createFile` does not overwrite — each run leaves another
 *     `traditions.json` in the Drive root. Take the newest.
 *   - `processSheetData_pre()` and `afficherTitresFeuilles()` are exploration
 *     helpers over the same sheets; they feed nothing.
 */

function afficherTitresFeuilles() {
  var classeur = SpreadsheetApp.getActiveSpreadsheet();
  var feuilles = classeur.getSheets();
  var res = ""  
  for (var i = 0; i < feuilles.length; i++) {
    res+='  "'+feuilles[i].getName()+'":"",\n';
  }
  Logger.log("{\n"+res+"}")
}

function processSheetData_pre() {
 var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
 var sheets = spreadsheet.getSheets();
 
 var globalResults = {};
 
 for (var i = 0; i < sheets.length; i++) {
   var sheet = sheets[i];
   var data = sheet.getDataRange().getValues();
   var sheetResults = {
     labels: null,
     values: []
   };
   
   for (var j = 1; j < data.length; j++) {
     var row = data[j];
     
     if (row[0] === '') {
       // If first cell is empty, use third cell content
       if (row[2] !== '') {
         sheetResults.values.push(row[2]);
       }
     } else {
       // If first cell is not empty, save current results and reset
       if (sheetResults.values.length > 0) {
         globalResults[sheet.getName() + '_' + Object.keys(globalResults).length] = { ...sheetResults };
       }
       
       // Reset sheetResults and set new labels
       sheetResults = {
         labels: {
           label1: row[0],
           label2: row[1]
         },
         values: []
       };
     }
   }
   
   // Save last set of results
   if (sheetResults.values.length > 0) {
     globalResults[sheet.getName() + '_' + Object.keys(globalResults).length] = { ...sheetResults };
   }
 }
 
 Logger.log(JSON.stringify(globalResults, null, 2));
 
 return globalResults;
}

function processSheetData() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = spreadsheet.getSheets();
  
  var globalResults = {};
  
  var sheetMapping = {
    'Nyingma': {id:'nyingma',bdr:'bdr:TraditionNyingma'},
    "Sakya":{id:"sakya",bdr:'bdr:TraditionSakya'},
    "Kagyu":{id:"kagyu",bdr:'bdr:TraditionKagyu'},
    "དགེ་ལུགས":{id:"geluk",bdr:'bdr:TraditionGeluk'},
    "བཀའ་གདམས་པ།":{id:"kadampa",bdr:'bdr:TraditionKadam'},
    "Bon":{id:"bon",bdr:'bdr:TraditionBon'},
    "Jonang":{id:"jonang",bdr:'bdr:TraditionJonang'},
    "Zhije":{id:"zhije",bdr:'bdr:TraditionZhije'},
    "Rime":{id:"rime",bdr:'bdr:TraditionRime'},
    "Poetry":{id:"poetry",bdr:'tmp:T281'},
    "History":{id:"history",bdr:'tmp:T1134'},
    "Karchak":{id:"karchak",bdr:'tmp:T13'},
  };
  
  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var sheetName = sheet.getName();
    var jsonKey = sheetMapping[sheetName]?.id || sheetName;
    var bdr = sheetMapping[sheetName]?.bdr || "tmp:tradi"+id;
    
    var data = sheet.getDataRange().getValues();
    
    var sheetResults = {
      "id":bdr,
      "classes": "display-block",
      "content": []
    };
    
    var currentItem = null;
    
    for (var j = 1; j < data.length; j++) {
      var row = data[j];
      
      if (row[0] !== '') {
        if (currentItem) {
          sheetResults.content.push(currentItem);
        }
        
        currentItem = {
          "id": "tmp:tradiCat"+i+"_"+j,
          "to": "/show/bdr::rid",
          "label": [
            { 
              "value": row[0], 
              "lang": "en" 
            },
            { 
              "value": row[1], 
              "lang": "bo" 
            }
          ],
          "content": []
        };
      }
      
      if (row[3] !== '') {
        var work = {
          "id": "bdr:"+row[2],
          "label": [{ 
            "lang": "bo",
            "value": row[1]
          }]
        };
        
        // Column E, the author: optional, so the key is only written when the cell
        // holds something. Same shape as `label` — an array of tagged values — so the
        // Tibetan name keeps its `lang` (getValues can hand back a number or a Date
        // for an oddly formatted cell, hence the String()).
        var author = String(row[4] ?? '').trim();
        if (author !== '') {
          work.author = [{
            "lang": "bo",
            "value": author
          }];
        }
        
        currentItem.content.push(work);
      }
    }
    
    if (currentItem) {
      sheetResults.content.push(currentItem);
    }
    
    globalResults[jsonKey] = sheetResults;
  }
  
  return globalResults;
}

function startConversionThenDownloadResultsJSON() {
  var globalResults = processSheetData();

  // A branch, not the working copy: a change to traditions-base.json reaches this
  // script only once it is pushed to the branch named here. Points at
  // `feature-living-library-route` since 2026-09-07 — that is the only branch with the
  // `kind` markers; master has none of them yet. Was `master` before that, and `new-UX`
  // until 2026-09-01. See the header note.
  var url = 'https://raw.githubusercontent.com/buda-base/public-digital-library/refs/heads/feature-living-library-route/public/traditions-base.json';
  var response = UrlFetchApp.fetch(url);
  var jsonData = JSON.parse(response.getContentText());
  
  // The one path this script owns — everything else in the output is the base as
  // fetched above (see the header note).
  jsonData.tradition.bo.subContent.selected = globalResults

  var jsonString = JSON.stringify(jsonData, null, 2);
    
  // Create a text file with JSON content
  DriveApp.createFile('traditions.json', jsonString, MimeType.PLAIN_TEXT);
}