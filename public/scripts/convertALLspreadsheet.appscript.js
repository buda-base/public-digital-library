
const DEBUG = false, DEBUG_SIZE = 100, DEBUG_SAVE = true // true --> only 10-20 nodes, output to Drive or not
const FORMAT = false // pretty formatting output 

const col_dir = 7, col_type = 8, col_bo = 9, col_en = 10, col_ID = 12, col_rela = 13, col_WA = 15

function getDepth(row) {
  for (var i = 0; i < 7; i++) {
    if (row?.[i] === 'X') return i
  }
  return -1
}

function pathToRoot(id, outline) {
  if(id === "bdr:PR1ER12") return []
  else {
    const parent = outline.find(n => n.hasPart?.includes(id))
    if(parent) return [parent].concat(pathToRoot(parent.id, outline))
    return []
  }
}

function processSheetData() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheets()?.[0];
  var data = sheet.getDataRange().getValues();
  var sheetName = sheet.getName();

  Logger.log("sheet: " + sheetName)

  var root = { id: "bdr:PR1ER12" }, prevDepth = -1, parent = [root], elem = null, outline = [], prev, otherNodes = {}
  for (var i = 0; i < (DEBUG ? DEBUG_SIZE : data.length); i++) {
    var row = data[i];
    var depth = getDepth(row)
    if (depth == -1) {
      Logger.log("WARNING no depth")
      return false
    } else {
      const rela = row[col_rela] ? row[col_rela].split(/ *, */) : [], author = [], topic = []
      for(const r of rela) {
        // TODO: is it always P --> author and other --> about? 
        if(r.startsWith("bdr:P")) author.push({id: r})
        else topic.push({id: r})
      }
      elem = {
        id: "bdr:MWALL_" + row[col_ID],
        "skos:prefLabel": [
          row[col_bo]
            ? { "@language": "bo-x-ewts", "@value": row[col_bo].toLowerCase() }
            : { "@language": "en", "@value": row[col_en] }
        ],
        "bf:identifiedBy":[{ id: "bdr:ID_ALL_"+row[col_ID]},{ id: "bdr:ID_ALL_D_"+row[col_ID]}].concat(row[col_type]?[{ id: "bdr:ID_ALL_T_"+row[col_ID]}]:[]),
        ...row[col_WA]?{ instanceOf: "bdr:"+row[col_WA].replace(/^W([^A])/,"WA$1")}:{},
        ...author.length?{ "tmp:author": author}:{},
        ...topic.length?{ "tmp:topic": topic}:{},
        _depth: depth,
        partType:row[col_dir] === "F" ? "bdr:PartTypeText":"bdr:PartTypeSection",
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

      if(parent[parent.length - 1]?._type !== "C") {

        if (!parent[parent.length - 1].hasPart) parent[parent.length - 1].hasPart = []
        parent[parent.length - 1].hasPart.push("bdr:MWALL_" + row[col_ID])

        const pID = parent[parent.length - 1].id
        if(!otherNodes[pID]) otherNodes[pID] = []
        otherNodes[pID].push({
          "id": "bdr:ID_ALL_"+row[col_ID],
          "rdf:value": row[col_ID],
          "type": "tmp:ALL_id"
        })
        otherNodes[pID].push({
          "id": "bdr:ID_ALL_D_"+row[col_ID],
          "rdf:value": row[col_dir],
          "type": "tmp:dir"
        })
        if(row[col_type]) otherNodes[pID].push({
          "id": "bdr:ID_ALL_T_"+row[col_ID],
          "rdf:value": row[col_type],
          "type": "tmp:type"
        })
      }



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

  /*
  // v2 for each node, itself and its direct children
  var globalResults = [root].concat(outline).reduce((acc, n) => ({
    ...acc,
    //...n.hasPart ? {
    [n.id]: [n].concat(outline.filter(m => n.hasPart?.includes(m.id))).concat(otherNodes[n.id]??[]).concat(pathToRoot(n.id, outline))
    //}:{} 
  }), {})
  */

  // v3 the whole tree + building the "by node" structure in the client
  var globalResults = [root].concat(outline).concat(Object.values(otherNodes).flat())
   

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