
const DEBUG = false, DEBUG_SIZE = 100, DEBUG_SAVE = true // true --> only 10-20 nodes, output to Drive or not
const FORMAT = false // pretty formatting output 

const col_dir = 7, col_type = 8, col_bo = 9, col_en = 10, col_ID = 12, col_rela = 13, col_WA = 15

function getDepth(row) {
  for (var i = 0; i < 7; i++) {
    if (row?.[i] === 'X') return i
  }
  return -1
}

function processSheetData() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheets()?.[0];
  var data = sheet.getDataRange().getValues();
  var sheetName = sheet.getName();

  Logger.log("sheet: " + sheetName)

  var root = { id: "bdr:PR1ER12" }, prevDepth = -1, parent = [root], elem = null, outline = [], prev
  for (var i = 0; i < (DEBUG ? DEBUG_SIZE : data.length); i++) {
    var row = data[i];
    var depth = getDepth(row)
    if (depth == -1) {
      Logger.log("WARNING no depth")
      return false
    } else {
      elem = {
        id: "bdr:MWALL_" + row[col_ID],
        "skos:prefLabel": [
          row[col_bo]
            ? { "@language": "bo-x-ewts", "@value": row[col_bo].toLowerCase() }
            : { "@language": "en", "@value": row[col_en] }
        ],
        _depth: depth,
        ...row[col_type] ? { _type: row[col_type] } : {}
        //_parent:parent[parent.length - 1].id
      }
      outline.push(elem)

      if (depth == prevDepth) {

      } else if (depth > prevDepth) {
        if (prev) parent.push(prev)
      } else if (depth < prevDepth) {
        do {
          parent.pop()
          prevDepth--;
        } while (depth < prevDepth)
      }

      if (!parent[parent.length - 1].hasPart) parent[parent.length - 1].hasPart = []
      parent[parent.length - 1].hasPart.push("bdr:MWALL_" + row[col_ID])



    }
    if (DEBUG) Logger.log("row " + i + ": " + row[col_ID] + " | " + depth + " | " + JSON.stringify(parent))
    prevDepth = depth
    prev = elem
  }

  // handle nodes with type X 
  outline = outline.map(n => {
    if(n._type === "X") {
      const sub = outline.filter(m => n.hasPart?.includes(m.id)) ?? []
      return ({ ...(sub[0]??{}), id:n.id, _type:n._type, _depth:n._depth, _subXid:sub?.[0]?.id, ...(sub.length > 1 ? {sub}:{}) })
    }
    return n
  })

  Logger.log(JSON.stringify(outline, null, 3))

  /* // v1 the whole tree
  var globalResults = { 
    "@context": "http://purl.bdrc.io/context.jsonld",
    "@graph": [root].concat(outline)
   };
   */

  
  // v2 for each node, itself and its direct children
  var globalResults = [root].concat(outline).reduce((acc, n) => ({
    ...acc,
    ...n.hasPart ? {[n.id]: [n].concat(outline.filter(m => n.hasPart?.includes(m.id)))}:{} 
  }), {})


  return globalResults;
}

function startConversionThenDownloadResultsJSON() {
  var globalResults = processSheetData();

  if (globalResults) {
    var jsonString = DEBUG || FORMAT ? JSON.stringify(globalResults, null, 3) : JSON.stringify(globalResults);

    // Create a text file with JSON content
    if (!DEBUG || DEBUG_SAVE) DriveApp.createFile('sungbum_ALL' + (DEBUG ? "_debug" : "") + '.json', jsonString, MimeType.PLAIN_TEXT);
    else Logger.log(jsonString)
  }
}