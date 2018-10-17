//@flow
import React from 'react';
import ReactDOM from 'react-dom';
import { shallow,mount } from 'enzyme';
import AnnotatedEtext from './AnnotatedEtext';
import AnnotatedEtextContainer from '../containers/AnnotatedEtextContainer';
import { createMockStore } from 'redux-test-utils';

const shallowWithStore = (component, store) => {
  const context = {
    store,
  };
  return shallow(component, { context });
};

describe('AnnotatedEtext tests', () => {
   it('creates default empty AnnotatedEtext', async() => {
      const testState = {
         test: {}
      };
      const store = createMockStore(testState)
      const component = shallowWithStore(<AnnotatedEtextContainer />, store);
      expect(typeof component).toBe('object')
   });
});
