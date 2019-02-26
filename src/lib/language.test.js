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
import {langScripts,makeLangScriptLabel} from "./language"


let makeRoutes = require('../routes').default
let bdrcAPI = require('../lib/api').default;

afterAll( (done) => {
   global.jsonServer.close(()=> { console.log("closed JSON server"); done(); })
})

// to check json-server at http://localhost:5555/test/
jest.setTimeout(10000)

describe('language settings tests', () => {

   it('initialization', async done => {
      tcpPortUsed.waitUntilUsed(5555).then( async () => {

         var config = (await(await fetch("http://localhost:5555/test/config.json")).json())
         expect(config.language).toMatchSnapshot()

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
})
