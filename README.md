# React Hook Router

A different approach to utilize a routing functionality in react.
I am using this router in an application which is running in production right now without any errors so far.
Until I found the time to write some real unit/integration tests for this router, it will remain in beta tough.

Tested from `React 16.8.1` up to `React 16.8.5`.

## How to install
Well, this is straightforward:

    npm i hookrouter
    
    
## Documentation
Detailed documentation about how to use hookrouter can be [found here](https://github.com/Paratron/hookrouter/blob/master/src-docs/pages/en/README.md)

## A quick example
```jsx harmony
import {useRoutes} from 'hookrouter';

const routes = {
    '/': () => <HomePage />,
    '/about': () => <AboutPage />,
    '/products': () => <ProductOverview />,
    '/products/:id': ({id}) => <ProductDetails id={id} />
};
	
const MyApp = () => {
    const routeResult = useRoutes(routes);
    
    return routeResult || <NotFoundPage />;
}
```
Routes are defined as an object. Keys are the routes, which are matched
against the URL, the values need to be functions that are called when a route
matches. You may define placeholders in your routes with `:something` which
will be forwarded as props to your function calls so you can distribute them
to your components.

The hook will return whatever the route function returned, so you may also return
strings, arrays, React fragments, null - whatever you like.
