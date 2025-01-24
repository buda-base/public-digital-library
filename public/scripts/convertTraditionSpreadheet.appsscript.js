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
        currentItem.content.push({
          "id": "bdr:"+row[2]
        });
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

  var url = 'https://raw.githubusercontent.com/buda-base/public-digital-library/refs/heads/new-UX/public/traditions-base.json';
  var response = UrlFetchApp.fetch(url);
  var jsonData = JSON.parse(response.getContentText());
  
  jsonData.tradition.bo.subContent.selected = globalResults

  var jsonString = JSON.stringify(jsonData, null, 2);
    
  // Create a text file with JSON content
  DriveApp.createFile('traditions.json', jsonString, MimeType.PLAIN_TEXT);
}