
const bdr = "http://purl.bdrc.io/resource/"

let miradorConfig, miradorSetUI

async function init() {

   let data = [
      { "collectionUri": "tibcolldemo2.json", location: "BDRC - Palpung Collection"}
   ]
   const urlParams = new URLSearchParams(window.location.search);
   const work = urlParams.get('work');
   if(work) {
      console.log("work",work)

      const resData = await(await fetch("http://purl.bdrc.io/graph/Resgraph?I_LIM=500&R_RES="+work+"&format=jsonld")).json()
      console.log(resData)
      let assocResData = await(await fetch("http://purl.bdrc.io/lib/allAssocResource?R_RES="+work)).json()
      if(assocResData && assocResData.data) assocResData = assocResData.data
      console.log(assocResData)

      let propK ;
      if(resData.status && resData.status == 404) { console.log("echec",work)}
      else if(resData["@graph"]) propK = resData["@graph"].filter(d => d["@id"] == work)[0]
      else propK = resData
      console.log("pK",propK)
      if(propK)
      {
         if(propK["workHasItem"]) {
            const item = propK["workHasItem"]
            const vol = assocResData[item.replace(/bdr:/,bdr)]
            console.log("vol",vol)
            if(vol.length > 1) {
               data = [
                  { "collectionUri" : "http://iiifpres.bdrc.io"+"/2.1.1/collection/i:"+item, location:"" }
               ]
            }
            else {
               data = [
                  { "manifestUri" : "http://iiifpres.bdrc.io"+"/2.1.1/v:bdr:"+vol[0]["value"].replace(new RegExp(bdr),"")+"/manifest", location:"" }
               ]
            }
         } else if(propK["imageList"]) {
            data = [
               { "manifestUri" : "http://iiifpres.bdrc.io"+"/2.1.1/v:"+work+"/manifest", location:"" }
            ]
         } else if(propK["hasIIIFManifest"]) {
            data = [
               { "manifestUri" : propK["hasIIIFManifest"]["@id"], location:"" }
            ]
         } else if(propK["workLocation"]) {
            data = [
               { "collectionUri" : "http://iiifpres.bdrc.io"+"/2.1.1/collection/wio:"+work, location:"" }
            ]
         }
      }
   }

   console.log("data",data)

   let config = miradorConfig(data);

   //console.log("mir ador",config,this.props)
   window.Mirador( config )

   miradorSetUI();
}

let waiter = setInterval( async ()=>{
   console.log("waiting")

   if(_ && window.jsEWTS) {
      clearInterval(waiter);
      miradorConfig = window.miradorConfig
      miradorSetUI  = window.miradorSetUI
      init();
   }

},100)
