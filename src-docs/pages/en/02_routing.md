# Routing

- [Defining routes](#defining-routes)
- [URL parameters](#url-parameters)
- [Nested routing](#nested-routing)
- [Can I use async functions?](#can-i-use-async-functions)
- [Lazy loading components](#lazy-loading-components)
- [Passing additional data to route functions](#passing-additional-data-to-route-functions)

## Defining routes
The `useRoutes()` hook consumes an object where the keys define paths and the values are functions to be called when 
a path matches. The router will try to match the paths one after another and will stop evaluating after a match has 
been found.

```jsx
const routes = {
    '/': () => <HomePage />,
    '/about': () => <InfoPage />
}
```

> __Heads up:__    
> Its recommendable to define the routes object _outside_ of your components. If you define it inside a component, the whole object will be re-created upon every render.

The callback functions are important so your components will only be created when a route matched and that function 
got called.

The router is built in a way that it not cares about what your route function returns. In most cases that would be a 
React component, but you may also return strings, numbers or anything.

If no match could be made, the route result will be `null` so you can easily display fallback content.

```jsx
import React from 'react';
import {useRoutes} from 'hookrouter';
import routes from './routes';
import {NotFoundPage} from './pages';

const MyApp = () => {
    const match = useRoutes(routes);

    return match || <NotFoundPage />;
}
```

> __Important to know__    
> Hookrouter will cache the route results. Because of that, your route result functions should be pure (side effect free). This means they should only rely on the parameters that are passed into the functions. If you want to pass additional data, [there is a pattern for that](#passing-additional-data-to-route-functions).

## URL parameters
Your paths may contain parts that should be consumed as parameters for your application. For example, a product page 
route would contain the ID of a product. 

To fetch these parameters, you can define named placeholders in your routes. They start with a colon `:` and all 
characters up until the next slash `/` will be captured. All named parameters will be forwarded to your route result 
function as a combined object.

```jsx
const routes = {
    '/product/:id/:variant': ({id, variant}) => <ProductPage productId={id} variant={variant} />
}
```

## Nested routing
You may nest routes so the sub route calls continue to work with a sub part of the
url.

### Example
This is your main application:
```jsx harmony
import {useRoutes, A} from 'hookrouter';

const routes = {
    '/': () => <HomePage />,
    '/about*': () => <AboutArea />
};
	
const MyApp = () => {
    const routeResult = useRoutes(routes);
	
    return (
        <div>
            <A href="/about/people">Show about area</A>
            {routeResult || <NotFoundPage />}			
        </div>		
    );
}
```
The asterisk `*` at the end of the route indicates that the URL will continue
but the later part is handled somewhere else. If the router notices an asterisk
at the end, it will forward the remaining part of the URL to child routers.

See whats done now inside the `<AboutArea />` component:

```jsx harmony
import {useRoutes, A} from 'hookrouter';

const routes = {
    '/people': () => 'We are happy people',
    '/company': () => 'Our company is nice'
};

const AboutArea = () => {
    const routeResult = useRoutes(routes);

    return (
        <div className="about">
            <A href="people">About people</A>
            <A href="company">About our company</A>
            {routeResult}
        </div>
    );
}
```

## Can I use async functions?
In short: no. You dont even want to use async functions! Your UI needs to be very responsive to any action you user 
performs. So routing is absolutely synchronous. But that doesnt mean you cannot perform async operations afterwards. 
You would use the router to display a loading placeholder instead that gets replaced whe the real content is available.

## Lazy loading components

Lazy loading and code splitting is very simple with hookrouter:

```jsx
import React from 'react';

const ProductPage = React.lazy(() => import('./pages/Product'));

const routes = {
    'product/:id': ({id}) => <ProductPage id={id} />
}
```

While this works, it would result in a blank paage until the missing code is fetched. I recommend wrapping the lazy 
component into a `Suspense` component to display fallback content until the code is loaded.


## Passing additional data to route functions
In our nested routes example I demonstrated how you can split routing for sub-parts of a bigger module of your 
application further down in the component tree. I also mentioned the fact that hookrouter does not exactly care what 
you return from your route functions. We can utilize that fact to optimize data fetching for our sub modules.

Imagine a product page that is broken down into separate sub parts. There is a general information page, a page about 
technical details and one to give you buying options. Lets say all three of them utilize the same product object. So we
are going to fetch that object in our central `<ProductPage />` component:

```jsx

const routes = {
    '/' => () => (product) => <GeneralInfo product={product} />,
    '/details': () => (product) => <Techdetails product={product} />,
    '/buy': () => (product) => <BuyOptions product={product} />
    '/buy/:variant': ({variant}) => (product) => <Buy product={product} variant={variant} />
};

const ProductPage = ({id}) => {
    const [productObj, status] = useProduct(id);
    const match = useRoutes(routes);

    if(!match){
        return 'Page not found';
    }

    if(status.loading){
        return 'Loading product...';
    }

    return match(productObj);
};
```

You can see: the route functions return functions themselves. We can feed additional data to those and have it available 
together with any url parameters when it comes to actually render a component. This is a mighty pattern that lets you 
fetch data for your components that would not have been available through URL parameters alone.
