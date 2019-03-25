//@flow
import {I18n} from 'react-redux-i18n';
import _ from 'lodash'
//import {toWylie,fromWylie} from "wylie"
import Sanscript from "@sanskrit-coders/sanscript"
import THLib from "jsewts"

export const transliterators = {
   "bo":{ "bo-x-ewts": (val:string) => THLib.toWylie(val) },
   "bo-x-ewts":{ "bo": (val:string) => THLib.fromWylie(val) },
   "sa-deva":{ "sa-x-iast": (val:string) => Sanscript.t(val,"devanagari","iast") },
   "sa-x-iast":{ "sa-deva": (val:string) => Sanscript.t(val.toLowerCase(),"iast","devanagari") },
}

export const langScripts = {
   "zh":"lang.langscript.zh", "en":"lang.langscript.en", "pi":"lang.langscript.pi", "bo":"lang.langscript.bo", "sa":"lang.langscript.sa", "inc":"lang.langscript.inc",
   "hans":"lang.langscript.hans","hant":"lang.langscript.hant",
   "deva":"lang.langscript.deva","newa":"lang.langscript.newa","sinh":"lang.langscript.sinh",
   "latn":"lang.langscript.ltn",
   "x-ewts":"lang.langscript.xEwts","x-dts":"lang.langscript.sDts","alalc97":"lang.langscript.alalc97","latn-pinyin":"lang.langscript.latnPinyin"

}

const dataLangUI = {
   "bo":{ "latin":[ "x-ewts", "x-dts", "alalc97" ] },
   "zh":{ "script": [ "hans", "hant" ], "latin":[ "latn-pinyin" ]},
   "inc":{ "sub":["sa", "pi" ], "script":[ "deva", "newa", "sinh" ], "latin":[ "x-iast", "x-iso", "alalc97" ] }
} ;

export function makeLangScriptLabel(code:string)
{
   if(!code.match(/^[a-z]{2}(-[a-z0-9-]+)?$/)) throw new Error("Malformed Code ("+code+")");

   let lang = code.substr(0,2)
   let script = code.substr(3)

   if(!langScripts[lang]) throw new Error("Unknown lang code ("+lang+")")
   if(script && !langScripts[script]) throw new Error("Unknown script code ("+script+")")
   //console.log("code",code,lang,script)

   let langLabel = I18n.t(langScripts[lang])
   let scriptLabel = "Unicode"
   if(script.length) scriptLabel = I18n.t(langScripts[script])
   //console.log("label",langLabel,scriptLabel)

   return langLabel + " (" + scriptLabel + ")"
}

export function extendedPresets(preset:string[])
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

export function sortLangScriptLabels(data:[],preset:string[],translit:{}={})
{
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

   data_ = _.orderBy(data_,['i'],["asc"]).map(e => e.tLit?e.tLit:e.e )

   //console.log("data_",data_)

   return data_
}
