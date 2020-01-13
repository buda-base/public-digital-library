

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
       eval('require(["https://cdn.jsdelivr.net/npm/tibetan-sort-js@2.1.0"],(obj) => { tibetSort = window["tibetan-sort-js"].default ; console.log("obj/tS",obj,tibetSort); window.moduleLoaded.tibetSort = tibetSort ; })')
   }
}
importModules();

export const transliterators = {
   "bo":{ "bo-x-ewts": (val) => jsEWTS.toWylie(val) },
   "bo-x-ewts":{ "bo": (val) => jsEWTS.fromWylie(val) },
   
   "sa-[Dd]eva":{ "sa-x-iast": (val) => Sanscript.t(val,"devanagari","iast") },
   "sa-x-iast":{ "sa-deva": (val) => Sanscript.t(val.toLowerCase(),"iast","devanagari") },
   
   "zh-[Hh]an[st]":{ "zh-latn-pinyin" : (val) => pinyin4js.convertToPinyinString(val, ' ', pinyin4js.WITH_TONE_MARK) },

   "zh-[Hh]ant":{ "zh-hans" : (val) => hanziConv.tc2sc(val) },
   "zh-[Hh]ans":{ "zh-hant" : (val) => hanziConv.sc2tc(val) },

   "(.*?)-[Tt]ibt":{ "(.*?)-x-ewts": (val) => jsEWTS.toWylie(val) },
   "(.*?)-x-ewts" :{ "(.*?)-Tibt"  : (val) => jsEWTS.fromWylie(val) },
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
    /*
   let preset_ =
      preset
      .map( k => [ k, ...(transliterators[k]?Object.keys(transliterators[k]):[]) ] )
      .reduce( (acc,k) => [...acc,...(k.length == 1?k:[k])],[])
      */

   // v2
   /*
   let extPreset = { flat:[], translit:{} }
   for(let k of preset) {
      extPreset.flat.push(k)
      for(let t of Object.keys(transliterators)) {
         if(transliterators[t][k]) {
            extPreset.flat.push(t)
            extPreset.translit[t] = k
         }
      }
   }
   */

   // v3

   let extPreset = { flat:[], translit:{} }
   for(let lg of preset) {
      //console.log("lg",lg) 
      extPreset.flat.push(lg)
      for(let src of Object.keys(transliterators)) {
         //console.log("  src",src)
         for(let dst of Object.keys(transliterators[src])) {
            //console.log("    dst",dst)
            let regexp 
            if(regexp = lg.match(new RegExp("^"+dst+"$"))) {
               //console.log("rx",regexp)
               if(src.indexOf("(.*?)") !== -1) src = src.replace(/\(([^)]+)\)/,regexp[1])
               if(dst.indexOf("(.*?)") !== -1) dst = dst.replace(/\(([^)]+)\)/,regexp[1])

               extPreset.flat.push(src)
               extPreset.translit[src] = dst
              
               //console.log("eP!",extPreset)
            }
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
   
   //console.log("sort",preset,translit,data)

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

      data[k] = data[k].map(e =>({...e, _val:(e.value !== undefined?e.value:e["@value"]).replace(/[↦↤]/g,"")}))

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
   
   //console.log("data_",data_)

   return data_
}


window.extendedPresets = extendedPresets
window.sortLangScriptLabels = sortLangScriptLabels
