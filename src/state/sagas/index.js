import { call, put, takeLatest, select, all } from 'redux-saga/effects';
import { INITIATE_APP } from '../actions';
import * as dataActions from '../data/actions';
import * as uiActions from '../ui/actions';
import selectors from '../selectors';
import store from '../../index';
import bdrcApi from '../../lib/api';

const api = new bdrcApi();

function* initiateApp(params) {
   try {
      const config = yield call([api, api.loadConfig]);
      yield put(dataActions.loadedConfig(config));
      yield put(dataActions.choosingHost(config.ldspdi.endpoints[config.ldspdi.index]));

      // console.log("params",params)

      if(params.q) yield put(dataActions.searchingKeyword(params.q,params.lg));

   } catch(e) {
      console.log('initiateApp error: %o', e);
      // TODO: add action for initiation failure
   }
}

function* watchInitiateApp() {
      yield takeLatest(
         INITIATE_APP,
         (action) => initiateApp(action.payload)
      );
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

export function* getDatatypes(key,lang) {

   try {

      const datatypes = yield call([api, api.getResultsDatatypes], key,lang);

      yield put(dataActions.foundDatatypes(key,datatypes));

   } catch(e) {
      yield put(dataActions.searchFailed(key, e.message));
      yield put(dataActions.notGettingDatatypes());
   }

}

export function* searchKeyword(keyword,language) {

   console.log("searchK",keyword,language);

   yield put(dataActions.loading(keyword, true));
   try {
      const result = yield call([api, api.getResults], keyword,language);

      yield put(dataActions.loading(keyword, false));
      yield put(dataActions.foundResults(keyword, language,result));
      //yield put(uiActions.showResults(keyword, language));

   } catch(e) {
      yield put(dataActions.searchFailed(keyword, e.message));
      yield put(dataActions.loading(keyword, false));
   }
}


export function* getOneDatatype(datatype,keyword,language:string) {

   console.log("searchK1DT",datatype,keyword,language);

   yield put(dataActions.loading(keyword, true));
   try {
      const result = yield call([api, api.getResultsOneDatatype],datatype,keyword,language);

      yield put(dataActions.loading(keyword, false));
      yield put(dataActions.foundResults(keyword, language, result));
      //yield put(uiActions.showResults(keyword, language));

   } catch(e) {
      yield put(dataActions.searchFailed(keyword, e.message));
      yield put(dataActions.loading(keyword, false));
   }
}

export function* watchSearchingKeyword() {

   yield takeLatest(
      dataActions.TYPES.searchingKeyword,
      (action) => searchKeyword(action.payload.keyword,action.payload.language)
   );
}

export function* watchGetDatatypes() {

   yield takeLatest(
      dataActions.TYPES.getDatatypes,
      (action) => getDatatypes(action.payload.keyword,action.payload.language)
   );
}

export function* watchGetOneDatatype() {

   yield takeLatest(
      dataActions.TYPES.getOneDatatype,
      (action) => getOneDatatype(action.payload.datatype,action.payload.keyword,action.payload.language)
   );
}
/** Root **/

export default function* rootSaga() {
   yield all([
      watchInitiateApp(),
      watchChoosingHost(),
      watchGetDatatypes(),
      watchGetOneDatatype(),
      watchSearchingKeyword()
   ])
}
