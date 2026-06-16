

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
      //loggergen.log("exception",f)
       window.moduleLoaded = {}
       __ = eval('_')
       jsEWTS = window.moduleLoaded.JsEWTS = window.jsEWTS ;
       eval('require(["https://cdn.jsdelivr.net/npm/@sanskrit-coders/sanscript@1.0.2/sanscript.min.js"],(obj) => { Sanscript = obj; /*loggergen.log("obj",obj);*/ window.moduleLoaded.Sanscript = obj ; })')
       eval('require(["https://cdn.jsdelivr.net/npm/pinyin4js@1.3.18/dist/pinyin4js.js"],(obj) => { pinyin4js = PinyinHelper; window.moduleLoaded.pinyin4js = PinyinHelper ; })')       
       eval('require(["https://cdn.jsdelivr.net/npm/hanzi-tsconv@0.1.2/dist/main.js"],(obj) => { hanziConv = window["hanzi-tsconv"].conv ; /*loggergen.log("obj/hzCv",hanziConv);*/ window.moduleLoaded.hanziConv = hanziConv ; })')
       eval('require(["https://cdn.jsdelivr.net/npm/tibetan-sort-js@2.1.2"],(obj) => { tibetSort = window["tibetan-sort-js"].default ; /*loggergen.log("obj/tS",obj,tibetSort);*/ window.moduleLoaded.tibetSort = tibetSort ; })')
       // TODO: can't load module in embedded/iframe viewer
       //eval('require(["https://cdn.jsdelivr.net/npm/html-entities@2.3.2/lib/index.min.js"],(obj) => { htmlEntities = obj; loggergen.log("obj htmlE",obj); window.moduleLoaded.htmlEntities = obj ; })')
   }
}
importModules();

export function fromWylie(s) {
    if (s.startsWith("*")) {
        return "*"+jsEWTS.fromWylie(s.substring(1))
    }
    return jsEWTS.fromWylie(s)
}

// Burmese -> Roman transliteration, ported from my_transliteration.py
// (ALA-LC and Sawada mappings, Ye Kyaw Thu, LU Lab.)
// Refs: https://online-resources.aa-ken.jp/resources/detail/IOR000125
//       http://www.aa.tufs.ac.jp/~sawadah/burroman2.pdf
//       https://www.loc.gov/catdir/cpso/roman.html
const sawadaTransliterationMap = {
   'ဦ': 'uu', 'ော': 'o', 'ို': 'ui', 'ဩော့': 'o.',
   'ော်': 'o’', 'က': 'k', 'ခ': 'kh', 'ဂ': 'g',
   'ဃ': 'gh', 'င': 'ng', 'စ': 'c', 'ဆ': 'ch',
   'ဇ': 'j', 'ဈ': 'jh', 'ည': 'N~', 'ဋ': 'T',
   'ဌ': 'Th', 'ဍ': 'D', 'ဎ': 'Dh', 'ဏ': 'N',
   'တ': 't', 'ထ': 'th', 'ဒ': 'd', 'ဓ': 'dh',
   'န': 'n', 'ပ': 'p', 'ဖ': 'ph', 'ဗ': 'b',
   'ဘ': 'bh', 'မ': 'm', 'ယ': 'y', 'ရ': 'r',
   'လ': 'l', 'ဝ': 'w', 'သ': 's', 'ဟ': 'h',
   'အ': '@', 'ဣ': 'i', 'ဤ': 'ii', 'ဥ': 'u',
   'ဧ': 'e', 'ဩ': 'o', 'ဪ': 'o’', 'ှ': 'h',
   'ျ': 'y', 'ြ': 'r', 'ွ': 'w', '္': '=',
   'ိ': 'i', 'ု': 'u', 'ေ': 'e', 'ာ': 'aa',
   'ါ': 'aa', 'ဉ': 'n~',
   'ီ': 'ii', 'ူ': 'uu', '်': '’', 'ဲ': 'Y',
   'ံ': 'M', '့': '.', 'း': ':', 'ဿ': 's=s',
   '၏': '\\i’', '၍': '\\rw’', '၌': '\\nh’', '၎': '\\l',
   '၊': '|', '။': '||',
   '၁': '1', '၂': '2', '၃': '3', '၄': '4', '၅': '5',
   '၆': '6', '၇': '7', '၈': '8', '၉': '9', '၀': '0'
}

const alalcTransliterationMap = {
   'ဦ': 'ū', 'ော': 'o', 'ို': 'ui', 'ဩော့': 'o‘',
   'ော်': 'o‘', 'က': 'k', 'ခ': 'kh', 'ဂ': 'g',
   'ဃ': 'gh', 'င': 'ṅ', 'စ': 'c', 'ဆ': 'ch',
   'ဇ': 'j', 'ဈ': 'jh', 'ည': 'ññ', 'ဋ': 'ṭ',
   'ဌ': 'ṭh', 'ဍ': 'ḍ', 'ဎ': 'ḍh', 'ဏ': 'ṇ',
   'တ': 't', 'ထ': 'th', 'ဒ': 'd', 'ဓ': 'dh', 'န': 'n',
   'ပ': 'p', 'ဖ': 'ph', 'ဗ': 'b', 'ဘ': 'bh',
   'မ': 'm', 'ယ': 'y', 'ရ': 'r', 'လ': 'l',
   'ဝ': 'v', 'သ': 's', 'ဟ': 'h', 'အ': '‘A', '္': '',
   'ာ': 'ā', 'ါ': 'ā', 'ဉ': 'ñ', 'ိ': 'i', 'ီ': 'ī', 'ု': 'u',
   'ူ': 'ū', 'ေ': 'e', 'ဲ': 'ai', 'ဣ': 'i',
   'ဤ': 'ī', 'ဥ': 'u', 'ဧ': 'e', 'ဩ': 'o',
   'ဪ': 'o‘', 'ျ': 'y', 'ြ': 'r', 'ွ': 'w',
   'ှ': 'h', '်': '’', 'ံ': 'ṃ', '့': '.', 'း': '"',
   'ဿ': 'ss', '၏': 'e*', '၍': 'r*', '၌': 'n*', '၎': 'l*',
   '၊': ',', '။': '.',
   '၁': '1', '၂': '2', '၃': '3', '၄': '4', '၅': '5',
   '၆': '6', '၇': '7', '၈': '8', '၉': '9', '၀': '0'
}

function transliterateBurmeseWith(text, mapping) {
   let result = ""
   let i = 0
   while (i < text.length) {
      let matched = false
      for (let length = 3; length >= 1; length--) {
         const chunk = text.substr(i, length)
         if (i + length <= text.length && mapping[chunk] !== undefined) {
            result += mapping[chunk]
            i += length
            matched = true
            break
         }
      }
      if (!matched) {
         const ch = text[i]
         result += (mapping[ch] !== undefined ? mapping[ch] : ch)
         i += 1
      }
   }
   return result
}

export function sawadaTransliteration(burmeseText) {
   return transliterateBurmeseWith(burmeseText, sawadaTransliterationMap)
}

export function alalcTransliteration(burmeseText) {
   return transliterateBurmeseWith(burmeseText, alalcTransliterationMap)
}

// Burmese (Unicode) -> DCL Standard transliteration, per the FPL guidelines
// (DCL/DHARMA scheme). Adds the inherent vowel 'a', handles stacking (virama),
// kinzi, medials and diacritics. Meant as a user-friendly romanization of
// Burmese-script names/titles.
// Notes / simplifications:
//  - asat (devowelizer) -> "·"  (U+00B7)
//  - medial wa ွ -> "v", consonant ဝ -> "v", အ -> "q"  (per doc)
//  - medials emitted in encounter order (~ y/r/v/h), no extra reordering
//  - original spaces are kept as-is (the doc's "#" convention is for catalog
//    input, not for a friendly display)
const DCL_CONS = {
   'က':'k','ခ':'kh','ဂ':'g','ဃ':'gh','င':'ṅ','စ':'c','ဆ':'ch','ဇ':'j','ဈ':'jh',
   'ည':'ññ','ဉ':'ñ','ဋ':'ṭ','ဌ':'ṭh','ဍ':'ḍ','ဎ':'ḍh','ဏ':'ṇ',
   'တ':'t','ထ':'th','ဒ':'d','ဓ':'dh','န':'n','ပ':'p','ဖ':'ph','ဗ':'b','ဘ':'bh',
   'မ':'m','ယ':'y','ရ':'r','လ':'l','ဝ':'v','သ':'s','ဟ':'h','ဠ':'ḷ',
   // အ is the zero-onset vowel carrier: kept silent so the (inherent or
   // dependent) vowel shows through -> "abhidhān" rather than the strict-DCL
   // machine marker "qabhidhān". Switch to 'q' if reversibility is needed.
   'အ':''
}
const DCL_INDEP = { 'ဣ':'i','ဤ':'ī','ဥ':'u','ဦ':'ū','ဧ':'e','ဩ':'o','ဪ':'o‘' }
const DCL_MEDIAL = { 'ျ':'y','ြ':'r','ွ':'v','ှ':'h' } // U+103B..U+103E
const DCL_VOWEL = { 'ာ':'ā','ါ':'ā','ိ':'i','ီ':'ī','ု':'u','ူ':'ū','ေ':'e','ဲ':'ai','ဳ':'ē' }
const DCL_VOWEL2 = { 'ော':'o','ို':'ui' }   // 2 codepoints
const DCL_VOWEL3 = { 'ော်':'o‘' }            // 3 codepoints (incl. asat)
const DCL_DIGIT = { '၀':'0','၁':'1','၂':'2','၃':'3','၄':'4','၅':'5','၆':'6','၇':'7','၈':'8','၉':'9' }
const DCL_ASAT = '်', DCL_VIRAMA = '္'
const DCL_ANUSVARA = 'ံ', DCL_DOT = '့', DCL_VISARGA = 'း'
const DCL_KINZI = 'င' + DCL_ASAT + DCL_VIRAMA // U+1004 U+103A U+1039

export function dclTransliteration(text) {
   if (!text) return text
   let out = ""
   let i = 0
   const n = text.length
   while (i < n) {
      // kinzi: ṅ with nothing before the next consonant
      if (text.substr(i, 3) === DCL_KINZI) { out += 'ṅ'; i += 3; continue }

      const c = text[i]
      if (DCL_CONS[c] !== undefined) {
         out += DCL_CONS[c]; i++
         // medials
         let med = ""
         while (i < n && DCL_MEDIAL[text[i]] !== undefined) { med += DCL_MEDIAL[text[i]]; i++ }
         // vowel + diacritics
         let vowel = "", hasVowel = false, killed = false, asat = "", post = ""
         let consuming = true
         while (i < n && consuming) {
            const v3 = text.substr(i, 3), v2 = text.substr(i, 2), v1 = text[i]
            if (!hasVowel && DCL_VOWEL3[v3] !== undefined) { vowel = DCL_VOWEL3[v3]; hasVowel = true; i += 3 }
            else if (!hasVowel && DCL_VOWEL2[v2] !== undefined) { vowel = DCL_VOWEL2[v2]; hasVowel = true; i += 2 }
            else if (!hasVowel && DCL_VOWEL[v1] !== undefined) { vowel = DCL_VOWEL[v1]; hasVowel = true; i++ }
            else if (v1 === DCL_ASAT) { asat = '·'; i++ }
            else if (v1 === DCL_VIRAMA) { killed = true; i++; consuming = false } // stack with next consonant
            else if (v1 === DCL_ANUSVARA || v1 === DCL_DOT) { post += 'ṃ'; i++ }
            else if (v1 === DCL_VISARGA) { post += 'ḥ'; i++ }
            else consuming = false
         }
         // inherent 'a' unless an explicit vowel, an asat, or a stack killed it
         if (!hasVowel && !asat && !killed) vowel = 'a'
         out += med + vowel + asat + post
      }
      else if (DCL_INDEP[c] !== undefined) {
         out += DCL_INDEP[c]; i++
         while (i < n) {
            const v1 = text[i]
            if (v1 === DCL_ASAT) { out += '·'; i++ }
            else if (v1 === DCL_ANUSVARA || v1 === DCL_DOT) { out += 'ṃ'; i++ }
            else if (v1 === DCL_VISARGA) { out += 'ḥ'; i++ }
            else break
         }
      }
      else if (DCL_DIGIT[c] !== undefined) { out += DCL_DIGIT[c]; i++ }
      else if (c === '၊') { out += ','; i++ }
      else if (c === '။') { out += '.'; i++ }
      else { out += c; i++ }
   }
   return out
}




export const transliterators = {
   "bo": { "bo-x-ewts": (val) => jsEWTS.toWylie(val) },
   "bo-tibt": { "bo-x-ewts": (val) => jsEWTS.toWylie(val) },
   "sa-tibt": { "bo-x-ewts": (val) => jsEWTS.toWylie(val) },
   "bo-x-ewts":{ "bo": (val) => fromWylie(val) },
   "dz": { "bo-x-ewts": (val) => jsEWTS.toWylie(val) },
   "dz-x-ewts": { "bo": (val) => fromWylie(val) },
   "sa-x-ewts": { "bo": (val) => fromWylie(val) },
   
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
   
   "zh":{ 
      "zh-latn-pinyin" : (val) => pinyin4js.convertToPinyinString(val, ' ', pinyin4js.WITH_TONE_MARK),
      "zh-hani":(val) => val
   },
   "zh-hans":{ 
      "zh-latn-pinyin" : (val) => pinyin4js.convertToPinyinString(val, ' ', pinyin4js.WITH_TONE_MARK), 
      "zh-hant" : (val) => hanziConv.sc2tc(val),
      "zh-hani" : (val) => val
   },
   "zh-hant":{ 
      "zh-latn-pinyin" : (val) => pinyin4js.convertToPinyinString(val, ' ', pinyin4js.WITH_TONE_MARK), 
      "zh-hans" : (val) => hanziConv.tc2sc(val),
      "zh-hani" : (val) => val 
   },
   "zh-hani":{ 
      "zh-latn-pinyin" : (val) => pinyin4js.convertToPinyinString(val, ' ', pinyin4js.WITH_TONE_MARK), 
      "zh-hant" : (val) => hanziConv.sc2tc(val), 
      "zh-hans" : (val) => hanziConv.tc2sc(val)
   },

   "km":{ "km-x-iast": (val) => Sanscript.t(val,"khmer","iast") },
   "km-x-iast":{ "km": (val) => Sanscript.t(val,"iast","khmer") },

   "my":{
      "my-x-dcl": (val) => dclTransliteration(val),
      "my-x-alalc": (val) => alalcTransliteration(val),
      "my-x-sawada": (val) => sawadaTransliteration(val)
   },

   "mymr":{
      "my-x-dcl": (val) => dclTransliteration(val),
      "my-x-alalc": (val) => alalcTransliteration(val),
      "my-x-sawada": (val) => sawadaTransliteration(val)
   },

   // quickfix for new search results

   "hani":{ 
      "zh-latn-pinyin" : (val) => pinyin4js.convertToPinyinString(val, ' ', pinyin4js.WITH_TONE_MARK) , 
      "zh-hant" : (val) => hanziConv.sc2tc(val) , 
      "zh-hans" : (val) => hanziConv.tc2sc(val) 
   },

   "khmr":{ "km-x-iast": (val) => Sanscript.t(val,"khmer","iast") },

   "iast":{ 
      "sa-deva": (val) => Sanscript.t(val.toLowerCase(),"iast","devanagari"),
      "sa-newa": (val) => Sanscript.t(val.toLowerCase(),"iast","newa"), 
      "sa-sinh": (val) => Sanscript.t(val.toLowerCase(),"iast","sinhala"), 
      "sa-khmr": (val) => Sanscript.t(val.toLowerCase(),"iast","khmer"),
      
      "pi-deva": (val) => Sanscript.t(val.toLowerCase(),"iast","devanagari") ,
      "pi-newa": (val) => Sanscript.t(val.toLowerCase(),"iast","newa"),
      "pi-sinh": (val) => Sanscript.t(val.toLowerCase(),"iast","sinhala"),
      "pi-khmr": (val) => Sanscript.t(val.toLowerCase(),"iast","khmer"),

      "km": (val) => Sanscript.t(val.toLowerCase(),"iast","khmer") 
   },
}

export function translitHelper(src,dst) {
   src = src?.toLowerCase()
   dst = dst?.toLowerCase()
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
   src = src.replace(/^[ \/_@#]+/, "")
   return src
}


const presets = { 
   "zh":[ "zh-hani", "bo" ],
   "bo":[ "bo", "zh-hani" ],
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
      if(!p) continue
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
         //loggergen.log("  src",src)
         for(let dst of Object.keys(transliterators[src])) {
            //loggergen.log("    dst",dst)
            let regexp 
            if (regexp = lg.match(new RegExp("^"+dst+"$"))) {
               //loggergen.log("rx",regexp)
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

   //loggergen.log("extP:",JSON.stringify(extPreset, null, 3),preset)

   return extPreset
}

export function sortLangScriptLabels(data,preset,translit,mergeXs = false, caseInsensitive = false)
{
   if(translit == undefined) translit={}
   if(!Array.isArray(data)) data = [ data ]
   
   //loggergen.log("sort", JSON.stringify(data,null,3), preset,translit,data)

   let data_ = data.filter(e => e && (e.value || e["@value"] || e.k)).map(e => {
      let k = e["lang"]
      if(!k) k = e["xml:lang"]
      if(!k) k = e["@language"]
      if(!k) k = ""
      k = k?.toLowerCase()
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

      //loggergen.log("k v",k,v,translit[k],e) //,transliterators)

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

      //loggergen.log("tLit",tLit,i)
      
      return {e,tLit,i:Number(i),k}
   })

   //loggergen.log("_",data_)

   data_ = __.orderBy(data_,['i'],["asc"]).map(e => e.tLit?e.tLit:e.e )

   data = {}

   for(let d of data_) {
      let lang = d.lang
      if(!lang) lang = d["xml:lang"]
      if(!lang) lang = d["@language"]
      if(!data[lang]) data[lang] = []
      data[lang].push(d)

      //loggergen.log("d",d)
   }

   data_ = []

   //loggergen.log("data",data)

   // #622 WIP: cant tell yet if it actually sorts anything?? actually it does once altLabels are not wrongly used anymore!
   const khmerSort = (a,b) => {
      const collator = new Intl.Collator('km')
      if(collator) return collator.compare(a._val,b._val)
      else if(a._val < b._val) return -1
      else if(a._val > b._val) return 1
      else return 0
   }

   for(let k of Object.keys(data)) {

      //loggergen.log("k",k)

      data[k] = data[k].map(e =>({...e, _val:(e.value !== undefined?e.value:(e["@value"]?e["@value"]:"")).replace(/[↦↤]/g,"")}))

      if(k === "bo" || k === "bo-Tibt") {
         //loggergen.log("sorting bo:",JSON.stringify(data[k],null,3))
         data_ = data_.concat(data[k].sort((a,b) => tibetSort.compare(a._val,b._val)))
      } else if(k.endsWith("ewts")) {
         //loggergen.log("sorting ewts:",JSON.stringify(data[k],null,3))
         data_ = data_.concat(data[k].sort((a,b) => tibetSort.compareEwts(a._val,b._val)))
      } else if(k.startsWith("km") || k.endsWith("khmr")) {
         //loggergen.log("sorting km:",JSON.stringify(data[k],null,3))
         data_ = data_.concat(data[k].sort(khmerSort))
      } else {
         //loggergen.log("sorting ?:",k,JSON.stringify(data[k],null,3))
         data_ = data_.concat(__.orderBy(data[k],[ d => caseInsensitive?d._val.toLowerCase():d._val ],['asc']))
      }
   }
   
   //loggergen.log("data_",JSON.stringify(data_,null,3))

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
   //loggergen.log("gMl:",data,extpreset)
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
      k = k?.toLowerCase()
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

   //loggergen.log("ret:",val,bestlt)

   // no need, data should not have entities
   // val = htmlEntitiesDecode(val) 

   return {"value": val, "lang": bestlt}
}

export function getMainLabels(data,extpreset)
{
   //loggergen.log("gMs:",data,extpreset)
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
     
     //loggergen.log("ret:",val,bestlt)

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