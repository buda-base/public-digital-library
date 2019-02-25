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
import {langScripts} from "./App"

let makeRoutes = require('../routes').default
let bdrcAPI = require('../lib/api').default;

afterAll( (done) => {
   global.jsonServer.close(()=> { console.log("closed JSON server"); done(); })
})

// to check json-server at http://localhost:5555/test/
//jest.setTimeout(10000)

describe('language settings tests', () => {

   it('initialization', async done => {
      tcpPortUsed.waitUntilUsed(5555).then( () => {

         expect(I18n.t(langScripts["bo"])).toEqual("Tibetan")

         done();
      })
   })

   /*
    it('initialization', async done => {
      tcpPortUsed.waitUntilUsed(5555).then( () => {

         //var config = (await(await fetch("http://localhost:5555/test/config.json")).json())
         //console.log("fetched",config.language)

         done();
      })
   })
   */
})
