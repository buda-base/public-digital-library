
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

// i18n
import thunk from 'redux-thunk';
import { loadTranslations, setLocale, syncTranslationWithStore, i18nReducer } from 'react-redux-i18n';

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

const translationsObject = {

   bo:boTranslation,
   en:enTranslation,
   fr:frTranslation,
   zh:zhTranslation,

}

const logger = store => next => action => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  if(!global.inTest) console.log('next state', store.getState())
  console.groupEnd(action.type)
  return result
}

const sagaMiddleware = createSagaMiddleware();
let store;
if (process.env.NODE_ENV !== 'production') {
   store = createStore(
      combineReducers({
         data:dataReducer,
         ui:uiReducer,
         i18n: i18nReducer
      }),
      composeWithDevTools(
         applyMiddleware(thunk,sagaMiddleware,logger)
      )
    );
} else {
    store = createStore(
      combineReducers({
         data:dataReducer,
         ui:uiReducer,
         i18n: i18nReducer
      }),
        applyMiddleware(thunk,sagaMiddleware)
    );
}

syncTranslationWithStore(store)
store.dispatch(loadTranslations(translationsObject));
store.dispatch(setLocale('en'));

export default store ;

sagaMiddleware.run(rootSaga);

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
