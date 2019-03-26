
import {miradorConfig,miradorSetUI} from "./src/lib/miradorSetup.js"

const bdr = "http://purl.bdrc.io/resource/"

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

      if(resData.status && resData.status == 404) { console.log("echec",work)}
      else if(resData["@graph"]) {
         const propK = resData["@graph"].filter(d => d["@id"] == work)[0]
         console.log("pK",propK)
         if(propK["workHasItem"]) {
            const item = propK["workHasItem"]
            const vol = assocResData[item.replace(/bdr:/,bdr)]
            console.log("vol",vol)
            if(vol.length > 1) {
               data = [
                  { "collectionUri" : "http://iiifpres.bdrc.io"+"/2.1.1/collection/i:"+item, location:"BDRC" }
               ]
            }
            else {
               data = [
                  { "manifestUri" : "http://iiifpres.bdrc.io"+"/2.1.1/v:bdr:"+vol[0]["value"].replace(new RegExp(bdr),"")+"/manifest", location:"BDRC" }
               ]
            }
         } else if(propK["imageList"]) {

         } else if(propK["hasIIIFManifest"]) {

         } else if(propK["workLocation"]) {
            data = [
               { "collectionUri" : "http://iiifpres.bdrc.io"+"/2.1.1/collection/wio:"+work, location:"BDRC" }
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

init()
