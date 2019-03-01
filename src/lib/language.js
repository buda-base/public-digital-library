//@flow
import {I18n} from 'react-redux-i18n';
import _ from 'lodash'

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

export function sortLangScriptLabels(data:[],preset:string[])
{
   //console.log("data",data)
   //console.log("preset",preset)

   let data_ = _.orderBy(data.map(e => {
      let k = e["lang"]
      if(!k) k = e["xml:lang"]
      if(!k) k = e["@language"]
      if(!k) k = ""
      k = preset.indexOf(k)
      if(k === -1) k = preset.length
      return {e,k}
   }),['k'],["asc"]).map(e => e.e)

   //console.log("data_",data_)

   return data_
}
