
const bdr = "http://purl.bdrc.io/resource/"

let iiifpres = "//iiifpres.bdrc.io"

let miradorConfig, miradorSetUI

async function init() {

   const urlParams = new URLSearchParams(window.location.search);
   const work = urlParams.get('work') || "bdr:W22084";
   if(urlParams.get('iiifpres')) iiifpres = "//" + urlParams.get('iiifpres') ;
   let data = [
      { "collectionUri" :iiifpres+"/2.1.1/collection/wio:"+work, location:"" }
   ]
   let lg = urlParams.get('lang') || "bo,zh-hans";
   lg = lg.split(",")
   let config = miradorConfig(data,null,null,null,lg,null,work);
   window.Mirador( config )
   miradorSetUI();
}

const urlParams = new URLSearchParams(window.location.search);
let origin = urlParams.get('origin') ;

// #831
const setAppToken = async (token) => {
   if(origin && token) {
      const url = "https://iiif.bdrc.io/setcookie"         
      const headers = new Headers({ "Authorization": "Bearer " + token })
      const response = await fetch( url, { method:"GET", headers })
      console.log("response:",await response.text())
   } 
}
const mainToken = urlParams.get('token')
const urlToken = urlParams.get('urlToken')
setAppToken(mainToken)
setAppToken(urlToken)

let waiter = setInterval( async ()=>{
   console.log("waiting")

   if(!origin) {
      window.$("#viewer").html("<div style='margin:20px'><h2>Embedded iframe must set <i>origin</i> parameter.<br/>See <a target='_blank' href='https://github.com/buda-base/public-digital-library/blob/master/BDRC_Embedded_Reader.md'>documentation</a> for further information.</h2></div>")
      clearInterval(waiter)
   }
   else if(_ && window.moduleLoaded &&  window.moduleLoaded.JsEWTS && window.moduleLoaded.Sanscript && window.moduleLoaded.pinyin4js && window.moduleLoaded.hanziConv) {
      clearInterval(waiter);
      miradorConfig = window.miradorConfig
      miradorSetUI  = window.miradorSetUI
      window.closeViewer = () => { parent.window.postMessage("close", "*"); }
      //init();
      const work = urlParams.get('work') || "bdr:W22084";
      let lg = urlParams.get('lang') || "bo,zh-hans";
      let uilg = urlParams.get('uilang') || "bo";
      lg = lg.split(",")
      window.miradorInitView(work,lg,null,uilg);
   }

},100)
