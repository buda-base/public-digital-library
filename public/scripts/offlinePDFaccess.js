
var params = new URLSearchParams(window.location.search);

var prefix = "./"
var p = params.get("prefix");
if(p) prefix = p 

var host = "https://library.bdrc.io"
var h = params.get("host"); 
if(h) host = h

if(!host.startsWith("http")) host = "http://"+host      
var loca = host+"?useDLD=true"      
var u = params.get("url");
if(u) {
  // don't decode or it will break 
  loca = u //decodeURIComponent(u) 
  if(!loca.includes("useDLD=")) {
    if(loca.match(/[?][^?]/)) loca +="&"
    else loca += "?"
    loca += "useDLD=true"
  }
}

var nav = document.querySelector("nav#top")
var close = document.querySelector("nav#top #close")
var volume = document.querySelector("nav#top #volume")
var selector = document.querySelector("nav#top #selector")
var pdf = document.querySelector("iframe#pdf")
var BUDA = document.querySelector("iframe#BUDA")
var label

BUDA.src = loca

window.addEventListener("message", async function (e) {              
  var tree = lists[userDLD]
  //console.log("msgEv:",e,userDLD,tree);
  var data = await JSON.parse(e.data)
  if (data["open-viewer"]) {
    if(tree && pdf.className != "on"){
      let rid = data["open-viewer"].rid
      let vol = 1, nbvol = 1
      if(data["open-viewer"].vol) vol = data["open-viewer"].vol           
      if(data["open-viewer"].nbVol) nbVol = data["open-viewer"].nbVol           
      let page
      if(data["open-viewer"].page) page = data["open-viewer"].page

      volume.innerHTML = "<span>Volume "+vol+"</span>"
      
      let src = tree[rid]
      let file = rid+"-"+(""+vol).padStart(3,"0")+".pdf"
      if(src) src += "/"+file
      if(prefix) src = prefix + src

      let selec = "<div>"
      for(let i = 1 ; i <= nbVol ; i ++) {              
        selec += "<span data-vol='"+i+"'"+(vol == i ? "class='selected'":"")+">Volume "+i+"</span>"
      }
      selec += "</div>"
      selector.innerHTML = selec

      document.querySelectorAll("nav#top #selector span").forEach(function(item) { 
        item.addEventListener("click", function(e) {
          selector.className = "off"
          console.log("e:",e.currentTarget)
          pdf.src = pdf.src.replace(/-[0-9]{3}[.]pdf.*?$/,"-"+e.currentTarget.dataset.vol.padStart(3,"0")+".pdf#page=1")
          setTimeout(function() { selector.className = "" }, 150)
        })

      });

      console.log("src:", rid, vol, page, src)

      // simple case: no previous pdf open, or a different version, or a different volume than before
      if(!pdf.src || !pdf.src.replace(/#page=.*?$/,"").endsWith(file)) { 
        console.log("1!",pdf.src)
        pdf.src = src + (page?"#page="+page:"")
      } else if(page) {
        console.log("2!")
        // a bit more complex if we need to update current page because changing src has no effect 
        // (see for example https://stackoverflow.com/questions/29707110/iframe-pdf-change-page-on-click-url)
        pdf.remove()
        pdf = document.createElement('iframe');
        pdf.id = "pdf"
        pdf.src = src + "#page="+page
        nav.parentNode.insertBefore(pdf, nav.nextSibling); // no insertAfter in API??
      }

      pdf.className = "on"
      BUDA.className = "off"
      nav.className = "on"



    } 
  } else if(data.url) {    
    let nextURL = host + data.url.path + data.url.search;          
    let search = window.location.search.replace(/([&?])url=[^&]+/,"")
    if(search && search.match(/^[?][^?]/)) search += "&"
    else search = "?"
    search += "url="+encodeURIComponent(nextURL)
    nextURL = window.location.pathname + search

    const nextTitle = 'no title yet';
    const nextState = { };

    console.log("nextURL:"+nextURL, nextTitle)

    window.history.pushState(nextState, nextTitle, nextURL);

  } else if(data.title) {
    document.title = data.title
  } else if(data.label) {
    if(!label || label != data.label.value) {
      label = data.label.value
      console.log("label:",label)
    }
  } else if(data.download) {

    let rid = data.download.rid
    let vol = data.download.nbVol

    let src = tree[rid]
    let file = rid+"-"+(""+vol).padStart(3,"0")+".pdf"
    if(src) src += "/"+file
    if(prefix) src = prefix + src
    
    const link = document.createElement("a")
    link.href = src
    link.setAttribute("download", file)
    link.click()
      
  }
}, true);

close.addEventListener("click",function(){
  nav.className = "off"
  pdf.className = "off"
  BUDA.className = "on"
})
      
function checkUnique() {
  console.log("unique?")
  // for all DLDs
  const dlds = Object.keys(lists)
  for(const dld of dlds){
    let unique = true
    const otherDLDs = dlds.filter(d => d != dld)
    // for all its RIDs
    const rids = Object.keys(lists[dld])
    for(const rid of rids) {
      for(const o of otherDLDs) {
        // check if it's in another DLD
        if(lists[o][rid] && lists[o][rid] === lists[dld][rid]) {
          unique = false
        }
      }
      // this rid is unique to this DLD
      if(unique) {
        console.log('"'+dld+'":"'+rid+'"')
        break;
      } 
    }
  }
}

var possibleDLDs = [ "CTC_18", "DLD_2018", "DLD_2018_ric", "DLD_2020_2021", "DLD_2021" ]; 
var uniqueForDLD = {
  "CTC_18": "W1AC343",
  "DLD_2018": "W00EGS1017030",
  "DLD_2018_ric": "W3CN15675",
  "DLD_2021": "W1NLM1030"
}

var testDLDs = [ ...possibleDLDs ], foundDLD
var timer 

if(window.location.host.startsWith("library.bdrc.io") || window.location.host.startsWith("localhost")) {
  userDLD = "DLD_2018"
  if(prefix === "./") prefix = "./99-DLDs/"
  window.DLD = lists[userDLD]
} else timer = setInterval(async function(){
  if(!possibleDLDs.some(d => !lists[d])) {
    clearInterval(timer)
    //console.log("all lists loaded")
    //checkUnique()
    for(const k of Object.keys(uniqueForDLD)) {
      const link = document.querySelector("#tmp-link")
      link.onerror = function(e){ 
        testDLDs = testDLDs.filter(d => d != k)
        //console.error('error:'+k,testDLDs,foundDLD); 
      }
      link.onload = function(e){ 
        foundDLD = k
        //console.error('loaded:'+k,testDLDs,foundDLD); 
      }
      link.href = prefix + lists[k][uniqueForDLD[k]] // + "/" + uniqueForDLD[k] + "-001.pdf"
      //console.log("link:",link)
      await new Promise(r => setTimeout(r, 150));
    }
    if(!foundDLD && testDLDs.length === 1) { 
      // can only be DLD_2020_2021 now, but we need to check at least one path to be sure
      const link = document.querySelector("#tmp-link")
      link.onload = function(e){ 
        foundDLD = "DLD_2020_2021"
        //console.error('loaded:'+k,testDLDs,foundDLD); 
      }
      link.href = prefix + lists["DLD_2020_2021"]["W27905"]
      //console.log("link:",link)
      await new Promise(r => setTimeout(r, 150));
    }
    if(foundDLD) {
      console.log("found DLD:",foundDLD)
      userDLD = foundDLD
      window.DLD = lists[userDLD]
    } else {
      alert("could not identify DLD version\nredirecting to online site")
      window.location.href = "https://library.bdrc.io/"
    }

  }
}, 650)
