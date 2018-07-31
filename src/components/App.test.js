import React from 'react';
import ReactDOM from 'react-dom';
//import makeMainRoutes from '../routes';
//import App from './App';
import AppContainer from '../containers/AppContainer';
//import ResourceViewer from './ResourceViewer';

describe('init test', function() {
   it('renders without crashing', () => {
     ReactDOM.render(<AppContainer/>, document.getElementById('root'));
     //ReactDOM.unmountComponentAtNode(document.getElementById('root'));
   });
})
