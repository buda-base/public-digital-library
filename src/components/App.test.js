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

let makeRoutes = require('../routes').default
let bdrcAPI = require('../lib/api').default;

afterAll( (done) => {
   global.jsonServer.close(()=> { console.log("closed JSON server"); done(); })
})

describe('main App tests', () => {

    it('init json-server', async done => {
      tcpPortUsed.waitUntilUsed(5555).then( () => {
            //console.log("youpi",global.jsonServer)

            done();
         })
      })


   it('loading config file from json-server', () => {
      tcpPortUsed.waitUntilUsed(5555).then( async done => {

         const api = new bdrcAPI({server:"http://localhost:5555"});

         let config =  await api.getURLContents("http://localhost:5555/config.json",false);
         expect(config).toMatchSnapshot()

         console.log("config",config)

         config =  await api.loadConfig();
         expect(config).toMatchSnapshot()

         done();
      })
   })

   /*
   it('App initialization', async done => {
      tcpPortUsed.waitUntilUsed(5555).then(async () => {

         const div = document.createElement('div');
         let compo ;
         ReactDOM.render( compo = makeRoutes(), div);
         expect(compo).toMatchSnapshot()

         setTimeout( () => { done(); }, 1000 );
      })
   })
  */
  /*
   it('start a search', async done => {
      tcpPortUsed.waitUntilUsed(5555).then(async () => {

         let compo = makeRoutes()
         let render = mount(compo)

         setTimeout( () => {
            render.find(SearchBar).prop('onRequestSearch')("'od zer")

            setTimeout( () => {
               expect(render.update().debug({ ignoreProps: true })).toMatchSnapshot()

            }, 500 );
         }, 100 );

         setTimeout( () => { done(); }, 1000 );
      })
   });
 */

})
