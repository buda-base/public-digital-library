//@flow
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

         // inspired from https://stackoverflow.com/questions/51226539/formik-testing-error-the-document-global-was-defined-when-react-was-initializ
         setTimeout( () => { done(); }, 400 );
      })
   })

   /*
   it('start a search', async done => {
      tcpPortUsed.waitUntilUsed(5555).then(async () => {

         let compo = mount(makeRoutes())

         setTimeout( () => {
            compo.find(SearchBar).prop('onRequestSearch')("'od zer")
         }, 1000 );

         // inspired from https://stackoverflow.com/questions/51226539/formik-testing-error-the-document-global-was-defined-when-react-was-initializ
         setTimeout( () => { done(); }, 10000 );
      })
   });
   */

})
