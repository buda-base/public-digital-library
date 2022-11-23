

let tibetSort,hanziConv,jsEWTS,Sanscript,pinyin4js,__ 


export const importModules = async () => {

   try { // in react app
       __  = await require("lodash")
       jsEWTS = await require("jsewts/src/jsewts.js")
       Sanscript = await require("@sanskrit-coders/sanscript")
       pinyin4js = await require("pinyin4js")
       hanziConv = await require("hanzi-tsconv")
       hanziConv = window["hanzi-tsconv"].conv
       tibetSort = await require("tibetan-sort-js")
       tibetSort = window["tibetan-sort-js"].default
       //htmlEntities = await require("html-entities") ;
   }
   catch(f) { // in embed iframe
      //console.log("exception",f)
       window.moduleLoaded = {}
       __ = eval('_')
       jsEWTS = window.moduleLoaded.JsEWTS = window.jsEWTS ;
       eval('require(["https://cdn.jsdelivr.net/npm/@sanskrit-coders/sanscript@1.0.2/sanscript.min.js"],(obj) => { Sanscript = obj; console.log("obj",obj); window.moduleLoaded.Sanscript = obj ; })')
       eval('require(["https://cdn.jsdelivr.net/npm/pinyin4js@1.3.18/dist/pinyin4js.js"],(obj) => { pinyin4js = PinyinHelper; window.moduleLoaded.pinyin4js = PinyinHelper ; })')       
       eval('require(["https://cdn.jsdelivr.net/npm/hanzi-tsconv@0.1.2/dist/main.js"],(obj) => { hanziConv = window["hanzi-tsconv"].conv ; console.log("obj/hzCv",hanziConv); window.moduleLoaded.hanziConv = hanziConv ; })')
       eval('require(["https://cdn.jsdelivr.net/npm/tibetan-sort-js@2.1.2"],(obj) => { tibetSort = window["tibetan-sort-js"].default ; console.log("obj/tS",obj,tibetSort); window.moduleLoaded.tibetSort = tibetSort ; })')
       // TODO: can't load module in embedded/iframe viewer
       //eval('require(["https://cdn.jsdelivr.net/npm/html-entities@2.3.2/lib/index.min.js"],(obj) => { htmlEntities = obj; console.log("obj htmlE",obj); window.moduleLoaded.htmlEntities = obj ; })')
   }
}
importModules();

export const transliterators = {
   "bo": { "bo-x-ewts": (val) => jsEWTS.toWylie(val) },
   "bo-tibt": { "bo-x-ewts": (val) => jsEWTS.toWylie(val) },
   "sa-tibt": { "bo-x-ewts": (val) => jsEWTS.toWylie(val) },
   "bo-x-ewts":{ "bo": (val) => jsEWTS.fromWylie(val) },
   "dz": { "bo-x-ewts": (val) => jsEWTS.toWylie(val) },
   "dz-x-ewts": { "bo": (val) => jsEWTS.fromWylie(val) },
   "sa-x-ewts": { "bo": (val) => jsEWTS.fromWylie(val) },
   
   "sa-deva":{ "sa-x-iast": (val) => Sanscript.t(val,"devanagari","iast") },
   "pi-deva":{ "pi-x-iast": (val) => Sanscript.t(val,"devanagari","iast") },
   "sa-newa":{ "sa-x-iast": (val) => Sanscript.t(val,"newa","iast") },
   "pi-newa":{ "pi-x-iast": (val) => Sanscript.t(val,"newa","iast") },
   "sa-sinh":{ "sa-x-iast": (val) => Sanscript.t(val,"sinhala","iast") },
   "pi-sinh":{ "pi-x-iast": (val) => Sanscript.t(val,"sinhala","iast") },
   "sa-khmr":{ "sa-x-iast": (val) => Sanscript.t(val,"khmer","iast") },
   "pi-khmr":{ "pi-x-iast": (val) => Sanscript.t(val,"khmer","iast") },
   "sa-x-iast":{ 
      "sa-deva": (val) => Sanscript.t(val.toLowerCase(),"iast","devanagari"),
      "sa-newa": (val) => Sanscript.t(val.toLowerCase(),"iast","newa"), 
      "sa-sinh": (val) => Sanscript.t(val.toLowerCase(),"iast","sinhala"), 
      "sa-khmr": (val) => Sanscript.t(val.toLowerCase(),"iast","khmer") 
   },
   "pi-x-iast":{ 
      "pi-deva": (val) => Sanscript.t(val.toLowerCase(),"iast","devanagari") ,
      "pi-newa": (val) => Sanscript.t(val.toLowerCase(),"iast","newa"),
      "pi-sinh": (val) => Sanscript.t(val.toLowerCase(),"iast","sinhala"),
      "pi-khmr": (val) => Sanscript.t(val.toLowerCase(),"iast","khmer") 
   },
   
   "zh-hans":{ 
      "zh-latn-pinyin" : (val) => pinyin4js.convertToPinyinString(val, ' ', pinyin4js.WITH_TONE_MARK) , 
      "zh-hant" : (val) => hanziConv.sc2tc(val) 
   },
   "zh-hant":{ 
      "zh-latn-pinyin" : (val) => pinyin4js.convertToPinyinString(val, ' ', pinyin4js.WITH_TONE_MARK) , 
      "zh-hans" : (val) => hanziConv.tc2sc(val) 
   },
   "zh-hani":{ 
      "zh-latn-pinyin" : (val) => pinyin4js.convertToPinyinString(val, ' ', pinyin4js.WITH_TONE_MARK) , 
      "zh-hant" : (val) => hanziConv.sc2tc(val) , 
      "zh-hans" : (val) => hanziConv.tc2sc(val) 
   },

   "km":{ "km-x-iast": (val) => Sanscript.t(val,"khmer","iast") },
   "km-x-iast":{ "km": (val) => Sanscript.t(val,"iast","khmer") },
}

export function translitHelper(src,dst) {
   if(transliterators[src] && transliterators[src][dst]) return transliterators[src][dst];
   else for(let k of Object.keys(transliterators)) { 
      if(src.match(new RegExp("^"+k+"$"))) for(let v of Object.keys(transliterators[k])) {
         if(dst.match(new RegExp("^"+v+"$"))) return transliterators[k][v]
      }  
   }
}

export function ewtsToDisplay(src) {
   src = src.replace(/_/g, " ")
   src = src.replace(/[ \/_*]+$/, "")
   src = src.replace(/^[ \/_*@#]+$/, "")
   return src
}


const presets = { 
   "zh":[ "zh-hant", "bo" ],
   "bo":[ "bo", "zh-hans" ],
   "km":[ "km", "pi-khmr", "en", "bo-x-ewts", "sa-x-iast" ],
   "en":[ "bo-x-ewts", "inc-x-iast" ]
}

export function extendedPresets(preset)
{
   // invscore is a score assigned to each possible lang tags, the lower the better. In the rest of the
   // code, we consider that invscore for lang tags not in the list is 99, with a score for no lang tag
   // being slightly higher, 98. Also we start at 1 to avoid unfortunate comparisons with 0 as being null
   let extPreset = { flat:[], translit:{}, invscores: { "": 98 } }
   let curscore = 1;

   // use sa-..., pi-... instead of inc-...
   let presetNoInc = [], handledKm = false

   // try to fix "not iterable" error in logs 
   if(!preset?.length) { 
      let langpreset = localStorage.getItem("langpreset")
      if(!langpreset) langpreset = "en"
      preset = presets[langpreset]
      if(!preset?.length) preset = [ "bo-x-ewts", "inc-x-iast" ]
   }

   for(const p of preset) {
      if(p.startsWith("inc")) { 
         presetNoInc.push(p.replace(/^inc/,"sa"))
         presetNoInc.push(p.replace(/^inc/,"pi"))
      } else if(!handledKm && p.startsWith("km-x")) {
         // if user selected km-x-iast, force khmer iast transliteration as fallback for x-twktt 
         if(p == "km-x-iast") presetNoInc.push("km-x-twktt")         
         presetNoInc.push(p)
         handledKm = true
      } else presetNoInc.push(p)
   }
   preset = presetNoInc

   for(let lg of preset) {
      extPreset.flat.push(lg)
      extPreset.invscores[lg] = curscore;
      curscore += 1;
      if (lg == "bo") {
        extPreset.invscores["dz"] = curscore;
        extPreset.invscores["sa-tibt"] = curscore;
      } else if (lg == "bo-x-ewts") {
        extPreset.invscores["dz-x-ewts"] = curscore;
        extPreset.invscores["sa-x-ewts"] = curscore;
      }
      // we bump the score twice, to account for the following cases:
      //  - when a user asks bo, they "automatically" ask "dz" and "sa-tibt", but at a slightly lower score:
      //  - when a user asks "zh-latn-pinyin", they automatically ask for a transformed "zh-han[tsi]", but at a slightly lower score
      for(let src of Object.keys(transliterators)) {
         //console.log("  src",src)
         for(let dst of Object.keys(transliterators[src])) {
            //console.log("    dst",dst)
            let regexp 
            if (regexp = lg.match(new RegExp("^"+dst+"$"))) {
               //console.log("rx",regexp)
               if(src.indexOf("(.*?)") !== -1) src = src.replace(/\(([^)]+)\)/,regexp[1])
               if(dst.indexOf("(.*?)") !== -1) dst = dst.replace(/\(([^)]+)\)/,regexp[1])

               extPreset.flat.push(src)
               extPreset.invscores[src] = curscore;
               extPreset.translit[src] = dst
            }
         }
      }
      curscore += 1;
   }

   //console.log("extP:",JSON.stringify(extPreset, null, 3),preset)

   return extPreset
}

export function sortLangScriptLabels(data,preset,translit,mergeXs = false, caseInsensitive = false)
{
   if(translit == undefined) translit={}
   if(!Array.isArray(data)) data = [ data ]
   
   //console.log("sort", JSON.stringify(data,null,3), preset,translit,data)

   let data_ = data.filter(e => e && (e.value || e["@value"] || e.k)).map(e => {
      let k = e["lang"]
      if(!k) k = e["xml:lang"]
      if(!k) k = e["@language"]
      if(!k) k = ""
      if(mergeXs) k = k.replace(/-x-.*$/,"-x")
      let v = e["value"]
      if(!v) v = e["@value"]
      if(!v) v = ""
      let i = preset.indexOf(k)
      
      let regexp ;
      //if(i === -1) { 
         for(let x in preset) {
            if(regexp = k.match(new RegExp("^"+preset[x]+"$"))) {               
               i = x ; 
               k = preset[x]
               break ; 
            }
         }
         if(i === -1) { 
            i = preset.length ;
            if(!k) i++
         }
      //}      

      //console.log("k v",k,v,translit[k],e) //,transliterators)

      let tLit
      if (translit[k]) {
         tLit = { ...e }
         let val = "@value", lan = "@language"
         if(!e["@value"]) {  val = "value" ; lan = "lang" ; tLit["type"] = "literal" ; }
         tLit[val] = translitHelper(k,translit[k])(v)
         tLit[lan] = translit[k]
         if(tLit["xml:lang"]) delete tLit["xml:lang"]
      } else if (k.endsWith("ewts")) {
         tLit = { ...e }
         let val = "@value", lan = "@language"
         if(!e["@value"]) {  val = "value" ; lan = "lang" ; tLit["type"] = "literal" ; }
         tLit[val] = ewtsToDisplay(v)
         tLit[lan] = k
         if(tLit["xml:lang"]) delete tLit["xml:lang"]
      }

      //console.log("tLit",tLit,i)
      
      return {e,tLit,i,k}
   })

   //console.log("_",data_)

   data_ = __.orderBy(data_,['i'],["asc"]).map(e => e.tLit?e.tLit:e.e )

   data = {}

   for(let d of data_) {
      let lang = d.lang
      if(!lang) lang = d["xml:lang"]
      if(!lang) lang = d["@language"]
      if(!data[lang]) data[lang] = []
      data[lang].push(d)

      //console.log("d",d)
   }

   data_ = []

   //console.log("data",data)

   // #622 WIP: cant tell yet if it actually sorts anything?? actually it does once altLabels are not wrongly used anymore!
   const khmerSort = (a,b) => {
      const collator = new Intl.Collator('km')
      if(collator) return collator.compare(a._val,b._val)
      else if(a._val < b._val) return -1
      else if(a._val > b._val) return 1
      else return 0
   }

   for(let k of Object.keys(data)) {

      //console.log("k",k)

      data[k] = data[k].map(e =>({...e, _val:(e.value !== undefined?e.value:(e["@value"]?e["@value"]:"")).replace(/[↦↤]/g,"")}))

      if(k === "bo" || k === "bo-Tibt") {
         //console.log("sorting bo:",JSON.stringify(data[k],null,3))
         data_ = data_.concat(data[k].sort((a,b) => tibetSort.compare(a._val,b._val)))
      } else if(k.endsWith("ewts")) {
         //console.log("sorting ewts:",JSON.stringify(data[k],null,3))
         data_ = data_.concat(data[k].sort((a,b) => tibetSort.compareEwts(a._val,b._val)))
      } else if(k.startsWith("km") || k.endsWith("khmr")) {
         //console.log("sorting km:",JSON.stringify(data[k],null,3))
         data_ = data_.concat(data[k].sort(khmerSort))
      } else {
         //console.log("sorting ?:",k,JSON.stringify(data[k],null,3))
         data_ = data_.concat(__.orderBy(data[k],[ d => caseInsensitive?d._val.toLowerCase():d._val ],['asc']))
      }
   }
   
   //console.log("data_",JSON.stringify(data_,null,3))

   return data_
}

/* //no need
export function htmlEntitiesDecode(val) {
   // TODO: can't load module in embedded/iframe viewer
   if(htmlEntities && val) {  
      if(!Array.isArray(val)) { 
         if(typeof val === "string" && val.match(/&#[0-9]+;/)) {
            val = val.replace(/&#[0-9]+;/g,(m) => htmlEntities.decode(m))
         }
      }
      else val = val.map(v => !v.match(/&#[0-9]+;/)?v:v.replace(/&#[0-9]+;/g,(m) => htmlEntities.decode(m)))
   }
   return val
}
*/

export function getMainLabel(data,extpreset)
{
   //console.log("gMl:",data,extpreset)
   if(!data) return ;
   else if(!Array.isArray(data)) data = [ data ]

   let useKmIast = extpreset.flat.includes("km-x-iast")

   let bestelt = null;
   let bestlt = null;
   let bestscore = 99;
   for(let e of data) {
      if(!e || !e.value && !e["@value"]) continue ;
      let k = e["lang"]
      if(!k) k = e["@language"]
      if(!k) k = e["xml:lang"]
      // case of strings with no lang tag
      if(!k) k = ""
      let thisscore = extpreset.invscores[k] || 99;
      if (thisscore < bestscore || bestelt === null) {
        bestelt = e;
        bestscore = thisscore;
        bestlt = k;
      }
   }
   let val
   if(bestelt) {
      val = bestelt["value"]
      if (!val) val = bestelt["@value"]
   }
   if (!val) return null;

   if ((useKmIast || !bestlt.endsWith("khmr")) && extpreset.translit[bestlt] && transliterators[bestlt] && transliterators[bestlt][extpreset.translit[bestlt]]) {
      val = transliterators[bestlt][extpreset.translit[bestlt]](val)
      bestlt = extpreset.translit[bestlt]
   } else if (bestlt.endsWith("ewts")) {
      val = ewtsToDisplay(val)
   }

   //console.log("ret:",val,bestlt)

   // no need, data should not have entities
   // val = htmlEntitiesDecode(val) 

   return {"value": val, "lang": bestlt}
}

export function getMainLabels(data,extpreset)
{
   //console.log("gMs:",data,extpreset)
   if(!data) return ;
   else if(!Array.isArray(data)) data = [ data ]

   let useKmIast = extpreset.flat.includes("km-x-iast")

   let bestelts = null;
   let bestlt = null;
   let bestscore = 99;
   for(let e of data) {
      let k = e["lang"]
      if(!k) k = e["@language"]
      if(!k) k = e["xml:lang"]
      // case of strings with no lang tag
      if(!k) k = ""
      let thisscore = extpreset.invscores[k] || 99;
      if (thisscore < bestscore || bestelts === null) {
        bestelts = [e];
        bestscore = thisscore;
        bestlt = k;
      } else if (thisscore === bestscore) {
        bestelts.push(e);
      }
   }
   let vals = []
   let destlt = bestlt
   for (let e of bestelts) {
     let val = e["value"]
     if (!val) val = e["@value"]
     if (!val) continue;

     if ((useKmIast || !bestlt.endsWith("khmr")) && extpreset.translit[bestlt] && transliterators[bestlt] && transliterators[bestlt][extpreset.translit[bestlt]]) {
        val = transliterators[bestlt][extpreset.translit[bestlt]](val)
        destlt = extpreset.translit[bestlt]
     } else if (bestlt.endsWith("ewts")) {
        val = ewtsToDisplay(val)
     }   
     
     //console.log("ret:",val,bestlt)

     // no need, data should not have entities
     // val = htmlEntitiesDecode(val)
     vals.push(val)
   }
   
   return {"values": vals, "lang": destlt}
}


window.extendedPresets = extendedPresets
window.sortLangScriptLabels = sortLangScriptLabels
window.getMainLabel = getMainLabel
window.getMainLabels = getMainLabels