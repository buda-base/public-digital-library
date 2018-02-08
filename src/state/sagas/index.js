import { call, put, takeLatest, select, all } from 'redux-saga/effects';
import { INITIATE_APP } from '../actions';
import * as dataActions from '../data/actions';
import * as uiActions from '../ui/actions';
import selectors from '../selectors';
import store from '../../index';
import bdrcApi from '../../lib/api';

const api = new bdrcApi();

function* initiateApp() {
   try {
      const config = yield call([api, api.loadConfig]);
      yield put(dataActions.loadedConfig(config));
      yield put(dataActions.choosingHost(config.ldspdi.endpoints[config.ldspdi.index]));
   } catch(e) {
      console.log('initiateApp error: %o', e);
      // TODO: add action for initiation failure
   }
}

function* watchInitiateApp() {
   yield takeLatest(INITIATE_APP, initiateApp);
}

export function* chooseHost(host:string) {
   try
   {
      yield call([api, api.testHost], host);
      yield put(dataActions.chosenHost(host));
   }
   catch(e)
   {
      // yield put(dataActions.chosenHost(host));
      yield put(dataActions.hostError(host,e.message));
   }
}

export function* watchChoosingHost() {

   yield takeLatest(
      dataActions.TYPES.choosingHost,
      (action) => chooseHost(action.payload)
   );
}

export function* searchKeyword(key) {

   // console.log("search",key);

   yield put(dataActions.loading(key, true));
   try {
      const result = yield call([api, api.getResults], key);
      yield put(dataActions.loading(key, false));
      yield put(dataActions.foundResults(key, result));
      yield put(uiActions.showResults(key));

   } catch(e) {
      yield put(dataActions.searchFailed(key, e.message));
      yield put(dataActions.loading(key, false));
   }
}

export function* watchSearchingKeyword() {

   yield takeLatest(
      dataActions.TYPES.searchingKeyword,
      (action) => searchKeyword(action.payload)
   );
}

/** Root **/

export default function* rootSaga() {
   yield all([
      watchInitiateApp(),
      watchChoosingHost(),
      watchSearchingKeyword()
   ])
}
