

let jsEWTS,Sanscript,__

const importModules = async () => {
   try {
      __  = await require("lodash")
      Sanscript = await require("@sanskrit-coders/sanscript")
      jsEWTS = await require("jsewts").default
   }
   catch(e)
   {
      jsEWTS = window.jsEWTS
      __ = eval('_')
   }

}
importModules();

export const transliterators = {
   "bo":{ "bo-x-ewts": (val) => jsEWTS.toWylie(val) },
   "bo-x-ewts":{ "bo": (val) => jsEWTS.fromWylie(val) },
   "sa-deva":{ "sa-x-iast": (val) => Sanscript.t(val,"devanagari","iast") },
   "sa-x-iast":{ "sa-deva": (val) => Sanscript.t(val.toLowerCase(),"iast","devanagari") },
}

export function extendedPresets(preset)
{
    /*
   let preset_ =
      preset
      .map( k => [ k, ...(transliterators[k]?Object.keys(transliterators[k]):[]) ] )
      .reduce( (acc,k) => [...acc,...(k.length == 1?k:[k])],[])
      */

   let extPreset = { flat:[], translit:{} }
   for(let k of preset) {
      extPreset.flat.push(k)
      if(transliterators[k]) {
         for(let t of Object.keys(transliterators[k])) {
            extPreset.flat.push(t)
            extPreset.translit[t] = k
         }
      }
   }

   //console.log("extP",extPreset)

   return extPreset
}

export function sortLangScriptLabels(data,preset,translit)
{
   if(translit == undefined) translit={}
   if(!Array.isArray(data)) data = [ data ]
   //console.log("sort",preset,translit) //,data)
   let data_ = data.map(e => {
      let k = e["lang"]
      if(!k) k = e["xml:lang"]
      if(!k) k = e["@language"]
      if(!k) k = ""
      let v = e["value"]
      if(!v) v = e["@value"]
      if(!v) v = ""
      let i = preset.indexOf(k)
      if(i === -1) i = preset.length

      let tLit
      if(translit[k]) {
         tLit = {} ;
         let val = "@value", lan = "@language"
         if(!e["@value"]) {  val = "value" ; lan = "lang" ; tLit["type"] = "literal" ; }
         tLit[val] = transliterators[k][translit[k]](v)
         tLit[lan] = translit[k]
      }

      return {e,tLit,i}
   })

   //console.log("_",data_)

   data_ = __.orderBy(data_,['i'],["asc"]).map(e => e.tLit?e.tLit:e.e )

   //console.log("data_",data_)

   return data_
}


window.extendedPresets = extendedPresets
window.sortLangScriptLabels = sortLangScriptLabels
