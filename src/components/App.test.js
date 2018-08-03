
import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
//import makeMainRoutes from '../routes';

describe('main', () => {

   it('renders without crashing', () => {
     const div = document.createElement('div');
     ReactDOM.render(<div/>, div);
   });
})
