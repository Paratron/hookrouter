const React = require('react');
const {renderToString} = require('react-dom/server');
const hookrouter = require('../../dist');

const path = '/product';

hookrouter.setPath(path);
hookrouter.setQueryParams({sort: 'desc'});

import App from './App';

const result = renderToString(<App/>);

console.log(`Rendering with path "${path}"`);
console.log(`Ended up on "${hookrouter.getPath()}"`);
console.log(result);

