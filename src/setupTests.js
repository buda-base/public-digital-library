import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import { XMLHttpRequest } from 'xmlhttprequest';
global.XMLHttpRequest = XMLHttpRequest;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

configure({ adapter: new Adapter() });

var localStorageMock = (function() {
  var store = {};
  return {
    getItem: function(key) {
      return store[key];
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    },
    removeItem: function(key) {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// debug mode VS quiet output
console.log = () => {}

/*
// deprecated - use json-server instead
Object.defineProperty(window, 'fetch', { value: function(url,options,param)
   {
      console.log("fetching",url,options,param);
   }
});
*/
