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
import {langScripts,makeLangScriptLabel,sortLangScriptLabels} from "./language"


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
   { "@language": "sa-alalc97", "@value": "mahasanti" }
] ;

const jsonLabels1 = [
   { type: "literal", value: "rdzogs chen/", lang: "bo-x-ewts" },
   { type: "literal", value: "great perfection", lang: "en" },
   { type: "literal", value: "大圆满", lang: "zh-hans" },
   { type: "literal", value: "rdzogs pa chen po/", lang: "bo-x-ewts" },
   { type: "literal", value: "mahasanti", lang: "sa-alalc97" },
] ;

const preset1 = [ "bo-x-ewts", "sa-alalc97" ]
const preset2 = [ "zh-hans", "bo-x-ewts", "en" ]


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

         expect(makeLangScriptLabel("bo")).toEqual("Tibetan (Unicode)")
         expect(makeLangScriptLabel("bo-x-ewts")).toEqual("Tibetan (EWTS)")
         expect(makeLangScriptLabel("zh-hant")).toEqual("Chinese (Traditional)")

         done();
      })
   })


   it('sorting json/jsonld labels', done => {

      const jsonldLabels1sorted1 = [
         { "@language": "bo-x-ewts", "@value": "rdzogs chen/" },
         { "@language": "bo-x-ewts","@value": "rdzogs pa chen po/" },
         { "@language": "sa-alalc97", "@value": "mahasanti" },
         { "@language": "en", "@value": "great perfection" },
         { "@language": "zh-hans", "@value": "大圆满" },
      ] ;

      const jsonLabels1sorted1 = [
         { type: "literal", value: "rdzogs chen/", lang: "bo-x-ewts" },
         { type: "literal", value: "rdzogs pa chen po/", lang: "bo-x-ewts" },
         { type: "literal", value: "mahasanti", lang: "sa-alalc97" },
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
         { "@language": "sa-alalc97", "@value": "mahasanti" },
      ] ;

      const jsonLabels1sorted2 = [
         { type: "literal", value: "大圆满", lang: "zh-hans" },
         { type: "literal", value: "rdzogs chen/", lang: "bo-x-ewts" },
         { type: "literal", value: "rdzogs pa chen po/", lang: "bo-x-ewts" },
         { type: "literal", value: "great perfection", lang: "en" },
         { type: "literal", value: "mahasanti", lang: "sa-alalc97" },
      ] ;

      const jsonResults12 = sortLangScriptLabels(jsonLabels1, preset2)
      const jsonldResults12 = sortLangScriptLabels(jsonldLabels1, preset2)

      expect(jsonResults12).toEqual(jsonLabels1sorted2)
      expect(jsonldResults12).toEqual(jsonldLabels1sorted2)

      done();
   })
})
