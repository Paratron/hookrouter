# Serverside rendering

- [Setting the path](#setting-the-path)
- [Setting query parameters](#setting-query-parameters)
- [Handling redirects](#handling-redirects)
- [Handling window title updates](#handling-window-title-updates)

## Setting the path
Use the `setPath()` function before you start rendering the application to manually
define a routing path beforehand.

```jsx
const React = require('react');
const {renderToString} = require('react-dom/server');
const hookrouter = require('../../dist');

const path = '/product';

hookrouter.setPath(path);

import App from './App';

const result = renderToString(<App/>);

console.log(`Rendering with path "${path}"`);
console.log(result);
```

## Setting query parameters
If you want to communicate query parameters to the app, call the `setQueryParams()`
function, passing an object of query parameters into the app. Call this before or
after `setPath()` but also before rendering the actual application.

If your app might modify the query parameters during rendering, you can retrieve them
afterwards using `getQueryParams()`, which returns an object, or `getQueryParamsString()`
which returns the serialized string.

## Handling redirects
If your app might perform any redirects during rendering, you can retrieve the updated
path after rendering by calling `getPath()`.

## Handling window title updates
If your app might have set a window title during rendering, you can retrieve it by calling
`getTitle()`.
