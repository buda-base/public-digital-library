require('../setupTests')

import React from 'react';
import ReactDOM from 'react-dom';
import { shallow,mount } from 'enzyme';
import I18n from 'i18next';
import store from '../index';
import {initiateApp} from '../state/actions';
import {keywordtolucenequery} from "./App"

describe('search bar input to lucene query', () => {

   it('advanced query', async done => {
      expect(keywordtolucenequery("test AND toto", "en")).toEqual('("test" AND "toto")');
      expect(keywordtolucenequery("\"test AND toto\"", "en")).toEqual('"test AND toto"');
      //expect(keywordtolucenequery("\"test AND toto\"~1", "en")).toEqual('"test AND toto"~1');
      expect(keywordtolucenequery("\"test\" AND \"toto\"", "en")).toEqual(('"test" AND "toto"'));
      expect(keywordtolucenequery("test AND toto", "bo-x-ewts")).toEqual('("test" AND "toto")');
      expect(keywordtolucenequery("test and toto", "en")).toEqual('"test and toto"');
      expect(keywordtolucenequery("test and toto", "bo-x-ewts")).toEqual('"test and toto"~1');
      done()
   })
})