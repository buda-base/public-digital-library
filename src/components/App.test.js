//@flow
import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';

require('../setupTests');
let makeRoutes = require('../routes').default


describe('main', () => {

   it('renders without crashing', () => {
     const div = document.createElement('div');
     ReactDOM.render(makeRoutes(), div);
   });
})
