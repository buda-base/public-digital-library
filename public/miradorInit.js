
const bdr = "http://purl.bdrc.io/resource/"

let miradorConfig, miradorSetUI

async function init() {

   const urlParams = new URLSearchParams(window.location.search);
   const work = urlParams.get('work') || "bdr:W22084";
   let data = [
      { "collectionUri" : "http://iiifpres.bdrc.io"+"/2.1.1/collection/wio:"+work, location:"" }
   ]

   let config = miradorConfig(data);
   window.Mirador( config )
   miradorSetUI();
}

let waiter = setInterval( async ()=>{
   console.log("waiting")

   if(_ && window.jsEWTS) {
      clearInterval(waiter);
      miradorConfig = window.miradorConfig
      miradorSetUI  = window.miradorSetUI
      window.closeViewer = () => { parent.window.postMessage("close", "*"); }
      init();
   }

},100)
