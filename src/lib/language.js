//@flow
import React from 'react';
import I18n from 'i18next';
//import {toWylie,fromWylie} from "wylie"
import 'intl-pluralrules' // #400

export const langScripts = {
   "zh":"lang.langscript.zh", "en":"lang.langscript.en", "pi":"lang.langscript.pi", "bo":"lang.langscript.bo", "sa":"lang.langscript.sa", "inc":"lang.langscript.inc", "km":"lang.langscript.km", "fr":"lang.langscript.fr",
   "hans":"lang.langscript.hans","hant":"lang.langscript.hant","hani":"lang.langscript.hani",
   "deva":"lang.langscript.deva","newa":"lang.langscript.newa","sinh":"lang.langscript.sinh",
   "latn":"lang.langscript.ltn",
   "x-ewts":"lang.langscript.xEwts","x-dts":"lang.langscript.sDts","alalc97":"lang.langscript.alalc97","latn-pinyin":"lang.langscript.latnPinyin",
   "x-iast":"lang.langscript.xIast",
   "khmr":"lang.langscript.km",
   "x-twktt":"lang.langscript.xTwktt",
   "x-ndia":"lang.langscript.xNdia",
   "x-bdrc":"lang.langscript.xBdrc",
   "x-femc":"lang.langscript.xFemc",
}

const dataLangUI = {
   "bo":{ "latin":[ "x-ewts", "x-dts", "alalc97" ] },
   "zh":{ "script": [ "hans", "hant" ], "latin":[ "latn-pinyin" ]},
   "inc":{ "sub":["sa", "pi" ], "script":[ "deva", "newa", "sinh" ], "latin":[ "x-iast", "x-iso", "alalc97" ] }
} ;

// from https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number#answer-57518703
const english_ordinal_rules = new Intl.PluralRules("en", {type: "ordinal"});
const suffixes = {
	one: "st",
	two: "nd",
	few: "rd",
	other: "th"
};
export function ordinal_en(number) {
	const suffix = suffixes[english_ordinal_rules.select(number)];
	return (number + suffix);
}


export function ordinal_bo(number) {	
	return ("དུས་རབས་"+numtobo(number)); // #561 removed དུས་རབས་ in bo translation/"misc.ord" to prevent double display
}


const numtobodic = {
  '0': '༠',
  '1': '༡',
  '2': '༢',
  '3': '༣',
  '4': '༤',
  '5': '༥',
  '6': '༦',
  '7': '༧',
  '8': '༨',
  '9': '༩'
}

export function numtobo(c) {
   var cstr = c.toString();
   var res = '';
	for (var c of cstr) {
      if(numtobodic[c]) res += numtobodic[c]
      else res += c
   }
   return res;
}

export function makeLangScriptLabel(code:string,span:boolean=false,incAsSaPi:false,useLang?:string)
{
   if(!useLang && !code.match(/^[a-z]{2,3}(-[a-z0-9-]+)?$/)) throw new Error("Malformed Code ("+code+")");

   let lang = useLang || code.replace(/^([^-]+).*?$/,"$1")
   let script = useLang ? code : code.replace(/^[^-]+(-(.+))?$/,"$2")

   if(useLang && code == "-") return I18n.t("lang.langscript.unicode")
   if(!langScripts[lang]) throw new Error("Unknown lang code ("+lang+")")
   if(script && !langScripts[script]) throw new Error("Unknown script code ("+script+")")
   //console.log("code",code,lang,script)
   
   let langLabel = I18n.t(langScripts[lang])
   let scriptLabel = lang != "en" ? "Unicode" : ""
   if(script.length) scriptLabel = I18n.t(langScripts[script])
   //console.log("label",langLabel,scriptLabel)

   let incHelper = ""
   if(incAsSaPi && lang == "inc") incHelper = I18n.t("lang.langscript.incHelper")+", "

   if(useLang) return scriptLabel 
   else if(!span) return langLabel + (scriptLabel?" (" + scriptLabel + ")":"")
   else return <span>{[langLabel, (scriptLabel?<span class="lang-info"> ({incHelper}{scriptLabel})</span>:null)].filter(e => e)}</span>
}
