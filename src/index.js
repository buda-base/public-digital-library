
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import AppContainer from './containers/AppContainer';
import { helloWorld } from './state/ui/actions';
import registerServiceWorker from './lib/registerServiceWorker';

// Material-UI
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import indigo from '@material-ui/core/colors/indigo';

// Redux
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

// Saga
import 'babel-polyfill';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './state/sagas'


// i18nify  deprecated
// import thunk from 'redux-thunk';
// import { loadTranslations, setLocale, syncTranslationWithStore, i18nReducer } from 'react-redux-i18n';


// i18next
import { i18nextInit, i18nextSaga } from 'i18next-redux-saga';
import i18nextReducer from './state/i18n-reducer';
import {numtobo,ordinal_en,ordinal_bo} from "./lib/language"
import { initReactI18next } from 'react-i18next';
import I18n from 'i18next';

// For dev only
import { composeWithDevTools } from 'redux-devtools-extension';

import uiReducer from './state/ui/reducers';
import dataReducer from './state/data/reducers';
import * as data from './state/data/actions' ;


import history from './history'
import qs from 'query-string'

import makeMainRoutes from './routes'

import logdown from 'logdown'

const loggergen = new logdown('gen', { markdown: false });

const enTranslation = require("./translations/en.json") ;
const zhTranslation = require("./translations/zh.json") ;
const boTranslation = require("./translations/bo.json") ;
const kmTranslation = require("./translations/km.json") ;
const frTranslation = require("./translations/fr.json") ;

/*
//derprecated
const translationsObject = {
   bo:boTranslation,
   en:enTranslation,
   zh:zhTranslation,
   km:zhTranslation,
}
*/

I18n.on('languageChanged', (lng) => {document.documentElement.setAttribute('lang', lng);})

// simple example i18next config with preloaded translations
const i18nextConfig = {
   nsSeparator: '|', // so we can use ':' for prefixes in properties
   fallbackLng: 'en', // set to false to display missing keys (+debug:true)
   //debug: true,   
   whitelist: [ 'bo', 'en', 'zh', 'km', 'fr' ],
   resources: {
      en: { translation: enTranslation },
      bo: { translation: boTranslation },
      zh: { translation: zhTranslation },
      km: { translation: kmTranslation },
      fr: { translation: frTranslation },
   },
   interpolation: {
      format: function(value, format, lng) {
         if (format === 'counttobo') { 
            //loggergen.log("numtobo?",value,format,numtobo(value),numtobo(""+value))
            return numtobo(""+value);
         }
         else if (format === 'counttozh' && value) { 
            return value.toLocaleString('zh-u-nu-hanidec');
         }
         else if (format === 'lowercase') return value.toLowerCase();
         else if (format === 'uppercase') return value.toUpperCase();
         else if (format === 'ordinal') {
            if(lng === "en") return ordinal_en(value);
            else if(lng === "bo") return ordinal_bo(value);
         }
         return value;
      }
   }
};


I18n.use(initReactI18next);



// NOTO
// x use simpler ontologySchema (=> reload when translate) cf http://purl.bdrc.io/query/graph/OntologyUiStrings?L_LNG=en&format=json
// DONE
// + bug publisher
// + translate number of results by datatype/facet
// + use unicode for tibetan when chinese selected
// + use original language in language switcher 
// + remove Auth / chinese server
// + outline | open appeared sibling nodes the usual way when search (not clicking '...')
// + outline | change icons etc.
// + search | fix 1st result link /search?q="red%20mda%27%20ba"&lg=bo-x-ewts&t=Instance 
// + search | rename "hasOpen" --> "OpenAccess"
// + search | fix reset filters (remove when nothing selected)
// + search | change sortBy menu to regular popover
// + search | intermediate/diagonal check state (both selected and unselected descendants)
// + translation | save preference (localStorage+url param 'lang'+defautl to navigator.language)
// + clean | remove ontology/core.json


// TODO profile
// - new design

// TODO search
// - use topic facet ancestors
// - close sortBy on selection
// - fix number of results when resource with status not released

// TODO mirador
// - use our translations
// - download pdf link not in another tab

// TODO safari
// - http://library.bdrc.io/search?q=%22dri%20med%20%27od%20zer%22&lg=bo-x-ewts&t=Work&uilang=en&s=work%20title%20reverse&pg=1&f=tree,inc,bdr:T23&f=tree,inc,bdr:T2183&f=tree,inc,bdr:T140&f=tree,inc,bdr:T354

// TODO translation
// - use lang=bo tag ("profile")
// - font / title bug
// - "has Scans"/"has Etext"

// TODO etext 
// - 404/401 "not found" / "must login"
// - fix Etext_base query to add volume number (ex: fresh load of /bdr:UT00KG03612_I00KG03625_0000 without loading bdr:IExyz before)

// TODO clean 


const logger = store => next => action => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  if(!global.inTest) loggergen.log('next state', store.getState())
  console.groupEnd(action.type)
  return result
}

const sagaMiddleware = createSagaMiddleware();
const i18nextMiddleware = createSagaMiddleware();

let store;
if (process.env.NODE_ENV !== 'production') {
   store = createStore(
      combineReducers({
         data:dataReducer,
         ui:uiReducer,
         //i18n: i18nReducer,
         i18next: i18nextReducer
      }),
      //composeWithDevTools(
         applyMiddleware(/*thunk,*/sagaMiddleware,i18nextMiddleware,logger)
      //)
    );
} else {
    store = createStore(
      combineReducers({
         data:dataReducer,
         ui:uiReducer,
         //i18n: i18nReducer,
         i18next: i18nextReducer
      }),
        applyMiddleware(/*thunk,*/sagaMiddleware,i18nextMiddleware)
    );
}

/* // i18nify deprecated
syncTranslationWithStore(store)
store.dispatch(loadTranslations(translationsObject));
store.dispatch(setLocale('en'));
*/

sagaMiddleware.run(rootSaga);
i18nextMiddleware.run(i18nextSaga);

store.dispatch(i18nextInit(i18nextConfig));

export default store ;
//const parsed = qs.parse(history.location.search);
//loggergen.log(parsed);


const theme = createMuiTheme({
    palette: {
        primary: indigo,
        secondary: indigo
    }
});

registerServiceWorker();

const go = () => {

   ReactDOM.render(
       makeMainRoutes(),
       document.getElementById('root')
   );
}

if(process.env.NODE_ENV !== 'test') go();

window.addEventListener("message",async function(ev){
   try {
      const data = await JSON.parse(ev.data)
      if(data.list) {
         loggergen.log("list:",data.list)
         window.DLD = data.list
         if(window.top) window.top.postMessage(JSON.stringify({listSent:true}), "*")
      }
   } catch(e) {
      // not json => do nothing
   }  
})

//store.dispatch(helloWorld());
// setTimeout(function(){ store.dispatch(data.searchingKeyword("'od zer")) },  500 )
