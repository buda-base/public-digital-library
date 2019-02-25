//@flow

/**
 * @jest-environment jsdom
 */

require('../setupTests')

import React from 'react';
import ReactDOM from 'react-dom';
import { shallow,mount } from 'enzyme';
import store from '../index';
import {initiateApp} from '../state/actions';
import tcpPortUsed from 'tcp-port-used'
import SearchBar from 'material-ui-search-bar'
import 'whatwg-fetch'

let makeRoutes = require('../routes').default
let bdrcAPI = require('../lib/api').default;

afterAll( (done) => {
   global.jsonServer.close(()=> { console.log("closed JSON server"); done(); })
})

// to check json-server at http://localhost:5555/test/
//jest.setTimeout(10000)

describe('main App tests', () => {

    it('init json-server', async done => {
      tcpPortUsed.waitUntilUsed(5555).then( () => {
            var fic = fetch("http://localhost:5555/test/config.json").then(async (msg) => {
               console.log("fetched",await msg.json())
               done();
            })
         })
      })

   it('loading config file from json-server', async done => {
      tcpPortUsed.waitUntilUsed(5555).then( async () => {

         const api = new bdrcAPI({server:"http://localhost:5555/test"});

         console.log("testing loading config")

         let config =  await api.getURLContents("http://localhost:5555/test/config.json",false);
         expect(config).toMatchSnapshot()

         console.log("test loaded config",config)

         console.log = () => {}
         console.info = () => {}

         config =  await api.loadConfig();
         expect(config).toMatchSnapshot()

         done();
      })
   })

   it('App initialization', async done => {
      tcpPortUsed.waitUntilUsed(5555).then( () => {

         console.log = () => {}
         console.info = () => {}

         const div = document.createElement('div');
         let compo ;
         ReactDOM.render( compo = makeRoutes(), div);
         expect(compo).toMatchSnapshot()

         done();
      })
   })


   it('start a search', async done => {
      tcpPortUsed.waitUntilUsed(5555).then( () => {

         console.log = () => {}
         console.info = () => {}

         let compo = makeRoutes()
         let render = mount(compo)

         setTimeout( () => {
            render.find(SearchBar).prop('onRequestSearch')("'od zer")

            setTimeout( () => {
               expect(render.update().debug({ ignoreProps: true })).toMatchSnapshot()

               done();
            }, 500 );
         }, 100 );

      })
   });

})
