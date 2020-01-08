//@flow

/**
 * @jest-environment jsdom
 */

require('../setupTests')

import React from 'react';
import ReactDOM from 'react-dom';
import { shallow,mount } from 'enzyme';
import {Translate, I18n} from 'react-redux-i18n';
import store from '../index';
import {initiateApp} from '../state/actions';
import tcpPortUsed from 'tcp-port-used'
import 'whatwg-fetch'
import {narrowWithString} from "./langdetect"
import {langScripts,makeLangScriptLabel} from "./language"
import {sortLangScriptLabels,transliterators,translitHelper,extendedPresets, importModules} from "./transliterators"

let makeRoutes = require('../routes').default
let bdrcAPI = require('../lib/api').default;

afterAll( (done) => {
   global.jsonServer.close(()=> { console.log("closed JSON server"); done(); })
})

// to check json-server at http://localhost:5555/test/
jest.setTimeout(10000)

const jsonldLabels1 = [
   { "@language": "bo-x-ewts", "@value": "rdzogs chen/" },
   { "@language": "en", "@value": "great perfection" },
   { "@language": "zh-hans", "@value": "大圆满" },
   { "@language": "bo-x-ewts","@value": "rdzogs pa chen po/" },
   { "@language": "sa-x-iast", "@value": "mahāśānti" }
] ;

const jsonLabels1 = [
   { type: "literal", value: "rdzogs chen/", lang: "bo-x-ewts" },
   { type: "literal", value: "great perfection", lang: "en" },
   { type: "literal", value: "大圆满", lang: "zh-hans" },
   { type: "literal", value: "rdzogs pa chen po/", lang: "bo-x-ewts" },
   { type: "literal", value: "mahāśānti", lang: "sa-x-iast" },
] ;

const preset1 = [ "bo-x-ewts", "sa-x-iast" ]
const preset2 = [ "zh-hans", "bo-x-ewts", "en" ]
const preset3 = [ "bo", "sa-deva", "zh-hans" ]
const preset4 = [ "en", "zh-latn-pinyin" ]
const preset5 = [ "bo-Tibt", "sa-deva" ]
const preset6 = [ "zh-hans", "zh-hant", "sa-deva" ]
const preset7 = [ "sa-deva", "zh-hant", "zh-hans" ]



describe('language settings tests', () => {

   it('initialization', async done => {
      tcpPortUsed.waitUntilUsed(5555).then( async () => {

         var config = (await(await fetch("http://localhost:5555/test/config.json")).json())
         expect(config.language).toMatchSnapshot()
         expect(config.language.data.presets[0][0]).toEqual("bo-x-ewts")

         expect(I18n.t(langScripts["bo"])).toEqual("Tibetan")

         expect(I18n.t(langScripts["sa"])).toEqual("Sanskrit")
         expect(I18n.t(langScripts["newa"])).toEqual("Newari")
         expect(I18n.t(langScripts["sa"]) + " ("+I18n.t(langScripts["newa"])+")").toEqual("Sanskrit (Newari)")

         done();
      })
   })

   it('makeLangScriptLabel', async done => {
      tcpPortUsed.waitUntilUsed(5555).then( async () => {

         var config = (await(await fetch("http://localhost:5555/test/config.json")).json())

         try { makeLangScriptLabel("abcde") } catch(e) { expect(e.toString()).toEqual("Error: Malformed Code (abcde)") }
         try { makeLangScriptLabel("ab") } catch(e) { expect(e.toString()).toEqual("Error: Unknown lang code (ab)") }
         try { makeLangScriptLabel("bo-abc") } catch(e) { expect(e.toString()).toEqual("Error: Unknown script code (abc)") }

         expect(makeLangScriptLabel("bo")).toEqual("Tibetan")
         expect(makeLangScriptLabel("bo-x-ewts")).toEqual("Tibetan (Wylie)")
         expect(makeLangScriptLabel("zh-hant")).toEqual("Chinese (Traditional)")

         done();
      })
   })


   it('sorting json/jsonld labels', () => {

      const jsonldLabels1sorted1 = [
         { "@language": "bo-x-ewts", "@value": "rdzogs chen/" },
         { "@language": "bo-x-ewts","@value": "rdzogs pa chen po/" },
         { "@language": "sa-x-iast", "@value": "mahāśānti" },
         { "@language": "en", "@value": "great perfection" },
         { "@language": "zh-hans", "@value": "大圆满" },
      ] ;

      const jsonLabels1sorted1 = [
         { type: "literal", value: "rdzogs chen/", lang: "bo-x-ewts" },
         { type: "literal", value: "rdzogs pa chen po/", lang: "bo-x-ewts" },
         { type: "literal", value: "mahāśānti", lang: "sa-x-iast" },
         { type: "literal", value: "great perfection", lang: "en" },
         { type: "literal", value: "大圆满", lang: "zh-hans" },
      ] ;

      const jsonResults11 = sortLangScriptLabels(jsonLabels1,preset1)
      const jsonldResults11 = sortLangScriptLabels(jsonldLabels1,preset1)

      expect(jsonResults11).toEqual(jsonLabels1sorted1)
      expect(jsonldResults11).toEqual(jsonldLabels1sorted1)

      const jsonldLabels1sorted2 = [
         { "@language": "zh-hans", "@value": "大圆满" },
         { "@language": "bo-x-ewts", "@value": "rdzogs chen/" },
         { "@language": "bo-x-ewts","@value": "rdzogs pa chen po/" },
         { "@language": "en", "@value": "great perfection" },
         { "@language": "sa-x-iast", "@value": "mahāśānti" },
      ] ;

      const jsonLabels1sorted2 = [
         { type: "literal", value: "大圆满", lang: "zh-hans" },
         { type: "literal", value: "rdzogs chen/", lang: "bo-x-ewts" },
         { type: "literal", value: "rdzogs pa chen po/", lang: "bo-x-ewts" },
         { type: "literal", value: "great perfection", lang: "en" },
         { type: "literal", value: "mahāśānti", lang: "sa-x-iast" },
      ] ;

      const jsonResults12 = sortLangScriptLabels(jsonLabels1, preset2)
      const jsonldResults12 = sortLangScriptLabels(jsonldLabels1, preset2)

      expect(jsonResults12).toEqual(jsonLabels1sorted2)
      expect(jsonldResults12).toEqual(jsonldLabels1sorted2)

   })


   it('testing transliterators/Wylie', async (done) => {

      await importModules()

      expect(transliterators["bo"]["bo-x-ewts"]('ཀ')).toEqual('ka')
      expect(transliterators["bo-x-ewts"]["bo"]('ka')).toEqual('ཀ')

      let extPreset1 = extendedPresets(preset1)
      let extPreset2 = extendedPresets(preset2)
      let extPreset3 = extendedPresets(preset3)
      let extPreset5 = extendedPresets(preset5)

      expect(extPreset1).toEqual({ flat:[ "bo-x-ewts", "bo", "bo-[Tt]ibt", "sa-x-iast", "sa-deva" ], translit:{ "bo":"bo-x-ewts", "bo-[Tt]ibt": "bo-x-ewts", "sa-deva": 'sa-x-iast' } })
      expect(extPreset2).toEqual({ flat:[ "zh-hans", "zh-[Hh]ant", "bo-x-ewts", "bo", "bo-[Tt]ibt", "en" ], translit:{ "bo":"bo-x-ewts", "bo-[Tt]ibt": "bo-x-ewts", "zh-[Hh]ant": "zh-hans"} })
      expect(extPreset3).toEqual({ flat:[ "bo", "bo-x-ewts", "sa-deva", "sa-x-iast", "zh-hans", "zh-[Hh]ant" ], translit:{ "bo-x-ewts":"bo", 'sa-x-iast': 'sa-deva', "zh-[Hh]ant": "zh-hans" } } )
      expect(extPreset5).toEqual({ flat:[ "bo-Tibt", "bo-x-ewts", "sa-deva", "sa-x-iast" ], translit:{ "bo-x-ewts":"bo-Tibt", 'sa-x-iast': 'sa-deva' } } ) 

      let extSortJson1 = [
         { type: 'literal', value: 'རྫོགས་ཆེན།', lang: 'bo' },
         { type: 'literal', value: 'རྫོགས་པ་ཆེན་པོ།', lang: 'bo' },
         { type: 'literal', value: 'मह̄श̄न्ति', lang: 'sa-deva' },
         { type: 'literal', value: '大圆满', lang: 'zh-hans' },
         { type: 'literal', value: 'great perfection', lang: 'en' }
      ]

      let extSortResultsJson1 = sortLangScriptLabels(jsonLabels1, extPreset3.flat, extPreset3.translit)
      expect(extSortResultsJson1).toEqual(extSortJson1);


      let extSortJsonld1 = [
         { '@value': 'རྫོགས་ཆེན།', '@language': 'bo' },
         { '@value': 'རྫོགས་པ་ཆེན་པོ།', '@language': 'bo' },
         { '@value': 'मह̄श̄न्ति', '@language': 'sa-deva' },
         { '@language': 'zh-hans', '@value': '大圆满' },
         { '@language': 'en', '@value': 'great perfection' },
      ]

      let extSortResultsJsonld1 = sortLangScriptLabels(jsonldLabels1, extPreset3.flat, extPreset3.translit)
      expect(extSortResultsJsonld1).toEqual(extSortJsonld1);

      let extSortJson2 = [
         { type: 'literal', value: 'རྫོགས་ཆེན།', lang: 'bo-Tibt' },
         { type: 'literal', value: 'རྫོགས་པ་ཆེན་པོ།', lang: 'bo-Tibt' },
         { type: 'literal', value: 'मह̄श̄न्ति', lang: 'sa-deva' },
         { type: 'literal', value: 'great perfection', lang: 'en' },
         { type: 'literal', value: '大圆满', lang: 'zh-hans' },
      ]

      let extSortResultsJson2 = sortLangScriptLabels(jsonLabels1, extPreset5.flat, extPreset5.translit)
      expect(extSortResultsJson2).toEqual(extSortJson2);

      done()
   })

    it('testing transliterators/others', async (done) => {

        await importModules()

        expect(translitHelper("zh-hant","zh-latn-pinyin")('厦门你好大厦厦门')).toEqual('xià mén nǐ hǎo dà shà xià mén')

        let extPreset4 = extendedPresets(preset4)
        let results = sortLangScriptLabels(
                        {"xml:lang": "zh-hant", type: "http://www.w3.org/2004/02/skos/core#prefLabel", value: "僧迦提婆"},
                        extPreset4.flat, extPreset4.translit
                      )
        expect(results).toEqual([ { type: 'literal',  value: 'sēng jiā tí pó', lang: 'zh-latn-pinyin' } ] )
        
        results = sortLangScriptLabels(
                        {"xml:lang": "zh-Hant", type: "http://www.w3.org/2004/02/skos/core#prefLabel", value: "無著菩薩"},
                        extPreset4.flat, extPreset4.translit
                      )
        expect(results).toEqual([ { type: 'literal',  value: 'wú zhuó pú sà', lang: 'zh-latn-pinyin' } ] )


         let jsonLabels = [
            {type: "literal", value: "寂天", lang: "zh-hant"},
            {type: "literal", value: "Śāntideva", lang: "sa-x-iast"},
            {type: "literal", value: "寂鎧", lang: "zh-hant"},
            {type: "literal", value: "Shi-ba lha", lang: "bo-x-dts"},
            {type: "literal", value: "寂鎧梵", lang: "zh-hant"}     
         ]

         let extSortJson = [
            {type: "literal", value: "寂天", lang: "zh-hans"},
            {type: "literal", value: "寂铠", lang: "zh-hans"},
            {type: "literal", value: "寂铠梵", lang: "zh-hans"},
            {type: "literal", value: "शान्तिदेव", lang: "sa-deva"},
            {type: "literal", value: "Shi-ba lha", lang: "bo-x-dts"}
         ]


         let extPreset6 = extendedPresets(preset6)
         results = sortLangScriptLabels(jsonLabels,extPreset6.flat, extPreset6.translit)

         expect(results).toEqual(extSortJson)

 
        done()
    })

   it('language autodetection', async (done) => {

      // typical usage: we know that the user is likely to use (in that order)
      // ewts, iast, anything else, we call:

      let userprefs = ["ewts", "iast", "pinyin"];
      let userprefs2 = [ "pinyin", "ewts", "iast"];

      expect(narrowWithString("d+har ma", userprefs)).toEqual(['ewts']);
      expect(narrowWithString("པདྨ", userprefs)).toEqual(['tibt']);
      expect(narrowWithString("ऩ", userprefs)).toEqual(['deva']);
      expect(narrowWithString("長阿含經", userprefs)).toEqual(['hani']);
      expect(narrowWithString("amṛta", userprefs)).toEqual(['iast']);
      expect(narrowWithString("cháng ā hán jīng", userprefs)).toEqual(['pinyin']);

      // this one is ambiguous and gives an array of two elements, but ordered according to the
      // user prefs, so the first is probably right
      expect(narrowWithString("Āgama", userprefs)).toEqual(['iast','pinyin']);
      expect(narrowWithString("Āgama", userprefs2)).toEqual(['pinyin','iast']);

      done()
   })

})


