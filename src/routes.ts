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

export interface RoutesObject {
    [key: string]: (props?: any) => any;
}

export const useRoutes = (routes: RoutesObject) => {
    const router = React.useContext(routerContext);
    const path = useSubscription(router);
    return React.useMemo(() => routes[path] ? routes[path]() : null, [path])
};
