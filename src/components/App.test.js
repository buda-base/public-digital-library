//@flow

/**
 * @jest-environment jsdom
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { shallow,mount } from 'enzyme';
import store from '../index';
import {initiateApp} from '../state/actions';
import tcpPortUsed from 'tcp-port-used'
import SearchBar from 'material-ui-search-bar'


require('../setupTests')
let makeRoutes = require('../routes').default
let bdrcAPI = require('../lib/api').default;

describe('main App tests', () => {

   it('loading config file from json-server', async() => {
      tcpPortUsed.waitUntilUsed(5555).then(async() => {

         const api = new bdrcAPI({server:"http://localhost:5555"});

         let config =  await api.getURLContents("http://localhost:5555/config.json",false);
         expect(config).toMatchSnapshot()

         config =  await api.loadConfig();
         expect(config).toMatchSnapshot()

      })
   })

   it('App initialization', async done => {
      tcpPortUsed.waitUntilUsed(5555).then(async () => {

         const div = document.createElement('div');
         let compo ;
         ReactDOM.render( compo = makeRoutes(), div);
         expect(compo).toMatchSnapshot()

         setTimeout( () => { done(); }, 400 );
      })
   })


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


})
