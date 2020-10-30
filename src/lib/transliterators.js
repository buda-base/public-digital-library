

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
   "sa-x-ewts": { "bo": (val) => jsEWTS.toWylie(val) },
   
   "sa-deva":{ "sa-x-iast": (val) => Sanscript.t(val,"devanagari","iast") },
   "sa-x-iast":{ "sa-deva": (val) => Sanscript.t(val.toLowerCase(),"iast","devanagari") },
   
   "zh-hans":{ "zh-latn-pinyin" : (val) => pinyin4js.convertToPinyinString(val, ' ', pinyin4js.WITH_TONE_MARK) , "zh-hant" : (val) => hanziConv.sc2tc(val) },
   "zh-hant":{ "zh-latn-pinyin" : (val) => pinyin4js.convertToPinyinString(val, ' ', pinyin4js.WITH_TONE_MARK) , "zh-hans" : (val) => hanziConv.tc2sc(val) },
   "zh-hani":{ "zh-latn-pinyin" : (val) => pinyin4js.convertToPinyinString(val, ' ', pinyin4js.WITH_TONE_MARK) , "zh-hant" : (val) => hanziConv.sc2tc(val) , "zh-hans" : (val) => hanziConv.tc2sc(val) },
}

export function translitHelper(src,dst) {
   if(transliterators[src] && transliterators[src][dst]) return transliterators[src][dst];
   else for(let k of Object.keys(transliterators)) { 
      if(src.match(new RegExp("^"+k+"$"))) for(let v of Object.keys(transliterators[k])) {
         if(dst.match(new RegExp("^"+v+"$"))) return transliterators[k][v]
      }  
   }
}

export function extendedPresets(preset)
{
   // invscore is a score assigned to each possible lang tags, the lower the better. In the rest of the
   // code, we consider that invscore for lang tags not in the list is 99, with a score for no lang tag
   // being slightly higher, 98. Also we start at 1 to avoid unfortunate comparisons with 0 as being null
   let extPreset = { flat:[], translit:{}, invscores: { "": 98 } }
   let curscore = 1;

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
   return extPreset
}

export function sortLangScriptLabels(data,preset,translit)
{
   if(translit == undefined) translit={}
   if(!Array.isArray(data)) data = [ data ]
   
   //console.log("sort",JSON.stringify(data,null,3)); //preset,translit,data)

   let data_ = data.map(e => {
      let k = e["lang"]
      if(!k) k = e["xml:lang"]
      if(!k) k = e["@language"]
      if(!k) k = ""
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
      if(translit[k]) {
         tLit = { ...e }
         let val = "@value", lan = "@language"
         if(!e["@value"]) {  val = "value" ; lan = "lang" ; tLit["type"] = "literal" ; }
         tLit[val] = translitHelper(k,translit[k])(v)
         tLit[lan] = translit[k]
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

   for(let k of Object.keys(data)) {

      //console.log("k",k)

      data[k] = data[k].map(e =>({...e, _val:(e.value !== undefined?e.value:(e["@value"]?e["@value"]:"")).replace(/[↦↤]/g,"")}))

      if(k === "bo" || k === "bo-Tibt") {
         data_ = data_.concat(data[k].sort((a,b) => tibetSort.compare(a._val,b._val)))
      }
      else if(k.endsWith("ewts")) {
         data_ = data_.concat(data[k].sort((a,b) => tibetSort.compareEwts(a._val,b._val)))
      }
      else {
         data_ = data_.concat(__.orderBy(data[k],[ "_val" ],['asc']))
      }
   }
   
   //console.log("data_",JSON.stringify(data_,null,3))

   return data_
}

export function getMainLabel(data,extpreset)
{
   if(!data) return ;
   else if(!Array.isArray(data)) data = [ data ]

   let bestelt = null;
   let bestlt = null;
   let bestscore = 99;
   for(let e of data) {
      if(!e) continue ;
      let k = e["lang"]
      if(!k) k = e["@language"]
      if(!k) k = e["xml:lang"]
      let thisscore = extpreset.invscores[k] || 99;
      if (thisscore < bestscore || bestelt === null) {
        bestelt = e;
        bestscore = thisscore;
        bestlt = k;
      }
   }
   let val = bestelt["value"]
   if (!val) val = bestelt["@value"]
   if (!val) return null;

   if (extpreset.translit[bestlt] && transliterators[bestlt] && transliterators[bestlt][extpreset.translit[bestlt]]) {
      val = transliterators[bestlt][extpreset.translit[bestlt]](val)
      bestlt = extpreset.translit[bestlt]
   }

   return {"value": val, "lang": bestlt}
}

export function getMainLabels(data,extpreset)
{
   if(!data) return ;
   else if(!Array.isArray(data)) data = [ data ]

   let bestelts = null;
   let bestlt = null;
   let bestscore = 99;
   for(let e of data) {
      let k = e["lang"]
      if(!k) k = e["@language"]
      if(!k) k = e["xml:lang"]
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
   for (let e of bestelts) {
     let val = e["value"]
     if (!val) val = e["@value"]
     if (!val) continue;

     if (extpreset.translit[bestlt] && transliterators[bestlt] && transliterators[bestlt][extpreset.translit[bestlt]]) {
        val = transliterators[bestlt][extpreset.translit[bestlt]](val)
        bestlt = extpreset.translit[bestlt]
     }
     vals.push(val)
   }
   
   return {"values": vals, "lang": bestlt}
}


window.extendedPresets = extendedPresets
window.sortLangScriptLabels = sortLangScriptLabels
window.getMainLabel = getMainLabel
window.getMainLabels = getMainLabels