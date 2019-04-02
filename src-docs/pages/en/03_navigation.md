# Navigation

- [Programmatic navigation](#programmatic-navigation)
- [Redirects](#redirects)
- [Using the link component](#using-the-link-component)
- [Intercepting navigation intents](#intervepting-navigation-intents)
- [Setting a base path](#setting-a-base-path)

## Programmatic navigation
If you want to send your user somewhere, you can call the `navigate(url, [replace], [queryParams])` function from the 
hookrouter package. You pass an URL (both relative or absolute) and the navigation will happen. After the navigation, 
all previous matches will be re-evaluated if they are valid anymore or if some components need to be swapped.

```jsx
navigate('/about');
```

By default, every call to `navigate()` is a forward navigation. That means a new entry in the browsing history of 
the user is created as if they visited a new page. Because of that, the user can click the back-button in their browser
to get back to previous pages.

However, in some cases you need a different behaviour: there may be pages that get invalid if you navigate back to them.
In that case you can do a replace navigation which erases the current history entry and replaces it with a new one. 
Set the second argument to `true` to achieve that.

```jsx
navigate('/confirmPage', true);
```

As an example, the `useRedirect()` hook uses a replace navigation internally.

The third and last argument allows you to set query string parameters with your navigation operation. You could encode
 them into your URL manually but often it is easier to pass an object, here.

```jsx
// These are the same
navigate('/test?a=hello&b=world');
navigate('/test', false, {a: 'hello', b: 'world'});
```

## Redirects
A redirect automatically forwards the user to a target path, if its source path matches.

Redirects trigger replacement navigation intents, which means there will remain
one entry in the navigation history. If a forward from `/test` to `/other` happens,
`/test` will not appear in the browsing history.


```jsx harmony
import {useRoutes, useRedirect} from 'hookrouter';

const routes = {
    '/greeting': () => 'Nice to meat you 🤤 ',
};

const MyApp = () => {
    useRedirect('/', '/greeting');
    const routeResult = useRoutes(routes);

    return routeResult || 'Not found';
}
```
Rule of thumb: apply the redirect right before you use the routing and everything
is fine ;)

You can pass an object of query parameters as third argument to the `useRedirect()` function. 


## Using the Link component
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

## Intercepting navigation intents
Sometimes it is necessary to interfere with the navigation intents of the user, based on certain conditions. 
You may want to ask before a user leaves a page with a half-filled form to prevent data loss. Or you have split a 
registration progress across several routes, let the user navigate there but not away from a certain base part of the 
URL. Or you want to forbit certain routes for some users. The scenarios may vary.

Introducing interceptors:

```jsx
const interceptFunction = (currentPath, nextPath) => {
    if(confirm('Do you want to leave?')){
        return nextPath;
    }
    return currentPath;
}

const GuardedForm = () => {
    const stopInterceptor = useInterceptor(interceptFunction);
    
    const handleSubmit = () => {
        saveData();
        stopInterceptor();
        navigate('/success');
    }
    
       
}
```

The interceptor hook gets called and the interceptor function enabled when the component containing the hook gets 
rendered the first time.

From the point of registration onwards, all navigation intents call the interceptor beforehands. The interceptor 
function gets passed the current and next path and can decide what to do. Whatever path is returned from the function 
will be the target of the navigation intent. If the current path is returned, no navigation happens at all.

When the component that created the interceptor gets unmounted, the interceptor will be stopped automatically.

Interceptors can be stacked, so when a sub component registers an interceptor while the parent component already did so,
they will be called in a chain with the last registered interceptor being called first. If one interceptor returns 
the current path, no other interceptors down the chain will be asked anymore.

You can manually stop the intercepor as well. The hook will return a function that cancels the interceptor.

## Setting a base path
