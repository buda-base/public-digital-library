
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import AppContainer from './containers/AppContainer';
import { initiateApp } from './state/actions';
import { helloWorld } from './state/ui/actions';
import registerServiceWorker from './lib/registerServiceWorker';

// Material-UI
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import indigo from 'material-ui/colors/indigo';

// Redux
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

// Saga
import 'babel-polyfill';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './state/sagas'

// For dev only
import { composeWithDevTools } from 'redux-devtools-extension';

import rootReducer from './state/reducers';
import * as data from './state/data/actions' ;


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
        rootReducer,
        composeWithDevTools(
            applyMiddleware(sagaMiddleware,logger)
        )
    );
} else {
    store = createStore(
        rootReducer,
        applyMiddleware(sagaMiddleware)
    );
}

export default store ;

sagaMiddleware.run(rootSaga);

store.dispatch(initiateApp());

const theme = createMuiTheme({
    palette: {
        primary: indigo,
        secondary: indigo
    }
});

ReactDOM.render(
    // setup redux store
    <Provider store={store}>
        <MuiThemeProvider theme={theme}>
            <AppContainer />
        </MuiThemeProvider>
    </Provider>,
    document.getElementById('root')
);

registerServiceWorker();

//store.dispatch(helloWorld());
// setTimeout(function(){ store.dispatch(data.searchingKeyword("'od zer")) },  500 )
