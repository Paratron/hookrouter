# React Hook Router

A different approach to utilize a routing functionality in react.
This is a rough test right now and should not be used in production until
I find the time to write a few unit tests for it.

Tested with `React 16.8.1`.

## How to use
A quick example:
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

## Navigation
You can either navigate by importing the function `navigate()` from the package,
or by importing the modified link component `A`. 

### Example with `navigate()`
```jsx harmony
import {useRoutes, navigate} from 'hookrouter';

const routes = {
    '/': () => <HomePage />,
    '/products/:id': ({id}) => <ProductDetails id={id} />
};
	
const handleClick = () => {
    navigate('/products/12');
};
	
const MyApp = () => {
    const routeResult = useRoutes(routes);
    
    return (
        <div>
            <Button onClick={handleClick}>Show my product</Button>
            {routeResult || <NotFoundPage />}			
        </div>		
    );
}
```

### Example with link component
```jsx harmony
import {useRoutes, A} from 'hookrouter';

const routes = {
    '/': () => <HomePage />,
    '/products/:id': ({id}) => <ProductDetails id={id} />
};
	
const MyApp = () => {
    const routeResult = useRoutes(routes);
	
	return (
        <div>
            <A href="/products/12">Show my product</A>
            {routeResult || <NotFoundPage />}			
        </div>		
	);
}
```
The `A` component works internally with a default `a` HTML tag. It will forward
all props to it, except an `onClick` function, which will be wrapped by the component,
since it intercepts the click event, stops the default behavior and pushes the
URL on the history stack, instead.

## Nesting Routes
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
