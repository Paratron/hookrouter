# Other helpful features

- [Setting the window title](#setting-the-window-title)
- [Using query parameters](#using-query-parameters)

## Setting the window title
When the user is navigating through your application you may wish to update the window
title according to the currently rendered route. To do that, I implemented a hook `useTitle()`.

```jsx
const AboutPage = () => {
    useTitle('About me');
    
    return (
        <div className="aboutPage">
            ...
        </div>
    );
}
```

When the component using the hook gets mounted, the window title will be set. If the component
gets unmounted, the previous title will be restored.

If you want to utilize the window title in an SSR environment, call `getTitle` after your
application rendering is done. 

## Using query parameters
In some cases it might be necessary to utilize query / search parameters to sync some application
state with the URL.

You might for example mirror a search string in the URL to enable the user to bookmark that search
or store filter settings for an overview page in the URL.

I implemented the `useQueryParams()` hook to do that. It automatically serializes and deserializes
query parameters from the URL. Even more: if you decide to update the query parameters, all components
using the hook will be re-rendered and can evaluate the new data.

Setting query params does _not_ trigger a navigation intent. Query parameters are not used for
routing in hookrouter.

```jsx
const SearchWidget = ({onSearch}) => {
    const [queryParams, setQueryParams] = useQueryParams();
    
    const {
        // Use object destructuring and a default value
        // if the param is not yet present in the URL.
        q = ''
    } = queryParams;
    
    const [searchBuffer, setSearchBuffer] = React.useState(q);
    
    const searchHandler = () => {
        setQueryParams({q: searchBuffer});
    }
    
    return (
        <div>
            <input type="search" value={searchBuffer} onChange={(e) => setSearchBuffer(e.currentTarget.value)} />
            <button onClick={searchHandler}>Search now</button>
        </div>
    );
}
```

And somewhere else:

```jsx
const SearchHeader = () => {
    const [queryParams] = useQueryParams();
        
    const {
        // Use object destructuring and a default value
        // if the param is not yet present in the URL.
        q = ''
    } = queryParams;
    
    return q 
        ? `You searched for "${q}"`
        : 'Please enter a search text';
}
```

If `<SearchWidget />` updates the query string, `<SearchHeader />` gets re-rendered.

## Using the URI path

In case you need to make use of the current URI path, you can use the `usePath()` hook:

```jsx
import {usePath} from 'hookrouter';

const PathLabel = () => {
    const path = usePath();
    return <span>Your current location: {path}</span>;
}
``` 

The hook will automatically render the component again, if the path changes. If you don't need that,
you can use the hook in passive mode: `usePath(false)` and it just returns the current path when the component
renders and does not trigger renders upon path change.
