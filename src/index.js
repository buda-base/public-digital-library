
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import AppContainer from './containers/AppContainer';
import { helloWorld } from './state/ui/actions';
import registerServiceWorker from './lib/registerServiceWorker';

// Material-UI
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import indigo from 'material-ui/colors/indigo';

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

import makeMainRoutes from './routes'
import history from './history'
import qs from 'query-string'

const translationsObject = {

   en:{
      lang:{
         en:"English",
         fr:"French",
         zh:"Chinese",
         bo:"Tibetan",
         lg:"Language",
         search:{
            zhHant:"Chinese (Hanzi)",
            zhLatnPinyin:"Chinese (Pinyin)",
            en:"English",
            saXIast:"Sanskrit (IAST)",
            saDeva:"Sanskrit (Devanagari)",
            bo:"Tibetan (Unicode)",
            boXEwts:"Tibetan (EWTS)"
         }
      },
      types:{
         "any":"All",
         "corporation":"Corporation",
         "etext":"Etext",
         "item":"Item",
         "lineage":"Lineage",
         "person":"Person",
         "place":"Place",
         "role":"Role",
         "topic":"Topic",
         "work":"Work"
      },
      search:{
         filters:{
            noresults:"No results matching your filters."
         }
      },
      Lsidebar:{
         title:"Refine your Search",
         collection:{
            title:"Collection"
         },
         datatypes:{
            title:"Data Types"
         }
      },
      Rsidebar:{
         title:"Display Preferences",
         UI:{
            title:"UI Language"
         },
         results:{
            title:"Results Preferred Language"
         }
      }
   },
   fr:{
      lang:{
         en:"Anglais",
         fr:"Français",
         zh:"Chinois",
         bo:"Tibétain",
         lg:"Langue",
         search:{
            zhHant:"Chinois (Hanzi)",
            zhLatnPinyin:"Chinois (Pinyin)",
            en:"Anglais",
            saXIast:"Sanskrit (IAST)",
            saDeva:"Sanskrit (Devanagari)",
            bo:"Tibétain (Unicode)",
            boXEwts:"Tibétain (EWTS)"
         }
      },
      types:{
         "any":"Tous",
         "corporation":"Entreprise",
         "etext":"Etexte",
         "item":"Élément",
         "lineage":"Lignée",
         "person":"Personne",
         "place":"Lieu",
         "role":"Rôle",
         "topic":"Thème",
         "work":"Oeuvre"
      },
      Lsidebar:{
         title:"Affinez votre Requête",
         collection:{
            title:"Collection"
         },
         datatypes:{
            title:"Types de Données"
         }
      },
      search:{
         filters:{
            noresults:"Pas de résultat correspondant à vos filtres."
         }
      },
      Rsidebar:{
         title:"Préférences d'Affichage",
         UI : {
            title :"Langue de l'UI"
         },
         results:{
            title:"Langue Préférée des Résultats"
         }
      }
   },
   zh:{},
   bo:{}

}

const logger = store => next => action => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  console.groupEnd(action.type)
  return result
}

const sagaMiddleware = createSagaMiddleware();
let store;
if (process.env.NODE_ENV === 'development') {
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

ReactDOM.render(
    makeMainRoutes(),
    document.getElementById('root')
);

registerServiceWorker();

//store.dispatch(helloWorld());
// setTimeout(function(){ store.dispatch(data.searchingKeyword("'od zer")) },  500 )
