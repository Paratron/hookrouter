# React Hook Router

The modern alternative to react-router.

Tested from `React 16.8.1` upwards.

## How to install
Well, this is straightforward:

    npm i hookrouter

## Typescript
This project is not and will not be written in typescript.

Thanks to the github user [@mcaneris](https://github.com/mcaneris), you can install types via:

    npm i @types/hookrouter
    
I did not check if those types are correct nor will I keep them up to date with future releases. 
    
    
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
