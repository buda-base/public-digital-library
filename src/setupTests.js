import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import jsonServer from 'json-server'
import tcpPortUsed from 'tcp-port-used'

import { XMLHttpRequest } from 'xmlhttprequest';
global.XMLHttpRequest = XMLHttpRequest;

global.inTest = true ;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

const { Response, Request, Headers, fetch } = require('whatwg-fetch');
global.Response = Response;
global.Request = Request;
global.Headers = Headers;
global.fetch = fetch;

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
//console.log = () => {}

/*
// deprecated - use json-server instead
Object.defineProperty(window, 'fetch', { value: function(url,options,param)
   {
      console.log("fetching",url,options,param);
   }
});
*/


const groups = [];
const hr = '-'.repeat(80); // 80 dashes row line

if (!console.group) {
  console.group = function logGroupStart(label) {
    groups.push(label);
    console.log(hr+'\nBEGIN GROUP: '+ label);
  };
}

if (!console.groupEnd) {
  console.groupEnd = function logGroupEnd() {
    console.log('END GROUP: '+ groups.pop() +"\n"+ hr);
  };
}
/*
tcpPortUsed.check(5555).then((inUse) => {
   if(!inUse)
   {*/
      let server = jsonServer.create()
      const router = jsonServer.router('src/tests/data.json')
      const middlewares = jsonServer.defaults()

      server.use(middlewares)
      server.use(router)
      server = server.listen(5555, () => {
         console.log('JSON Server is running')
         global.jsonServer = server
      })
      /*
   }
})
*/
