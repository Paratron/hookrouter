import React from 'react';
import ReactDOM from 'react-dom';
import {setBasepath} from "../../dist";

if(location.pathname.match(/^\/basepath/)){
	setBasepath('/basepath');
}

import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
