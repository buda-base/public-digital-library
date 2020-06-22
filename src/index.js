
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
import {numtobo} from "./lib/language"


// For dev only
import { composeWithDevTools } from 'redux-devtools-extension';

import uiReducer from './state/ui/reducers';
import dataReducer from './state/data/reducers';
import * as data from './state/data/actions' ;


import history from './history'
import qs from 'query-string'

import enTranslation from "./translations/en" ;
import frTranslation from "./translations/fr" ;
import zhTranslation from "./translations/zh" ;
import boTranslation from "./translations/bo" ;

import makeMainRoutes from './routes'

//derprecated
const translationsObject = {

   bo:boTranslation,
   en:enTranslation,
   //fr:frTranslation,
   zh:zhTranslation,
}


// simple example i18next config with preloaded translations
const i18nextConfig = {
   nsSeparator: '|', // so we can use ':' for prefixes in properties
   fallbackLng: 'en', // set to false to display missing keys (+debug:true)
   //debug: true,   
   whitelist: [ 'bo', 'en', 'zh'],
   resources: {
      en: { translation: enTranslation },
      bo: { translation: boTranslation },
      zh: { translation: zhTranslation },
   },
   interpolation: {
      format: function(value, format, lng) {
         if (format === 'counttobo') { 
            //console.log("numtobo?",value,format,numtobo(value),numtobo(""+value))
            return numtobo(""+value);
         }
         else if (format === 'counttozh' && value) { 
            return value.toLocaleString('zh-u-nu-hanidec');
         }
         return value;
      }
   }
};

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

// TODO profile
// - new design

// TODO translation
// - save preference (localStorage+url param 'lang'+defautl to navigator.language)

// TODO search
// - change sortBy menu to regular popover
// - fix reset filters (remove when nothing selected)
// - use topic facet ancestors
// - intermediate/diagonal check state (both selected and unselected descendants)

// TODO mirador
// - use our translations
// - download pdf link not in another tab

// TODO outline


const logger = store => next => action => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  if(!global.inTest) console.log('next state', store.getState())
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
//console.log(parsed);


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


//store.dispatch(helloWorld());
// setTimeout(function(){ store.dispatch(data.searchingKeyword("'od zer")) },  500 )
