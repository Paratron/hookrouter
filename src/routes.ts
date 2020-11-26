import React from "react";
import { Subscription, useSubscription } from "use-subscription";

export interface SubscribableRouter extends Subscription<string> {
    navigate: (nextUrl: string) => void;
}

export function createBrowserRouter(basePath?: ""): SubscribableRouter {
    const memoryRouter = createMemoryRouter(document.location.pathname);

    window.addEventListener("click", (e) => {
        // @ts-ignore
        if (e.target?.nodeName === "A") {

        }
    });

    window.addEventListener("popstate", (e) => {
        memoryRouter.navigate(document.location.pathname);
    });

    memoryRouter.subscribe(() => {
        window.history.pushState(null, "", memoryRouter.getCurrentValue());
    });

    return memoryRouter;
}

export function createMemoryRouter(initialPath: string = "/"): SubscribableRouter {
    let path = initialPath;
    const subscriptions = new Map();

    return {
        navigate: (nextUrl: string) => {
            path = nextUrl;
            subscriptions.forEach((v, callback) => callback());
        },
        getCurrentValue: () => path,
        subscribe: (callback: (nextPath: string) => void) => {
            subscriptions.set(callback, 1);
            return () => subscriptions.delete(callback);
        }
    }
}

const defaultRouter = typeof window !== "undefined" ? createBrowserRouter() : createMemoryRouter();
const routerContext = React.createContext(defaultRouter);

interface RouterProviderProps {
    children: React.ReactNode;
    router: SubscribableRouter;
}

export const RouterProvider = ({ children, router }: RouterProviderProps) => {
    return React.createElement(routerContext.Provider, { value: router }, children);
};

const pathPropMatcher = /\[([a-zA-Z0-9]+?)]/g;

export function getPathProps(pathMatcher: string): [RegExp | string, string[]] {
    const pathProps = pathMatcher.match(pathPropMatcher);
    if (!pathProps) {
        return [pathMatcher, []];
    }
    const propNames: string[] = [];
    let regexString = pathMatcher;
    pathProps.forEach(propName => {
        propNames.push(propName.substr(1, propName.length - 2));
        regexString = regexString.replace(propName, `(.+?)`);
    })
    return [new RegExp(regexString), propNames];
}

type PreparedRoute<T> = [RegExp | string, string[], RouteFunction<T>];

function prepareRoutes<T>(receipt: RoutesObject<T>): PreparedRoute<T>[] {
    return Object.entries(receipt).map(([matcher, routeFunction]) => [...getPathProps(matcher), routeFunction]);
}

function findRoute<T>(preparedRoutes: PreparedRoute<T>[], path: string): T | null {
    for(let i = 0; i < preparedRoutes.length; i++){
        const [matcher, propNames, routeFunction] = preparedRoutes[i];
        if(typeof matcher === "string"){
            if(path === matcher){
                return routeFunction();
            }
            continue;
        }
        let props = matcher.exec(path);
        if (props) {
            props.shift();
            return routeFunction(props.reduce((obj: {[key: string]: string}, value, i) => {
                obj[propNames[i]] = value;
                return obj;
            }, {})) as T;
        }
    }
    return null;
}

type RouteFunction<T> = (props?: any) => T;

export interface RoutesObject<T> {
    [key: string]: RouteFunction<T>;
}

export const useRoutes = <T = React.ReactNode>(routes: RoutesObject<T>): T | null => {
    const router = React.useContext(routerContext);
    const path = useSubscription(router);
    const preparedRoutes = React.useMemo(() => prepareRoutes<T>(routes), [routes]);
    return React.useMemo(() => findRoute<T>(preparedRoutes, path), [path, preparedRoutes])
};
