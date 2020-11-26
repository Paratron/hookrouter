import React from "react";
import { create, act, ReactTestRenderer } from 'react-test-renderer';
import { SubscribableRouter, RouterProvider } from "./routes";

export function mountHook(hookCall: Function, routerObject: SubscribableRouter) {
    const HookComponent = hookCall;
    let root: ReactTestRenderer = create((
        <RouterProvider router={routerObject}>
            <HookComponent/>
        </RouterProvider>
    ));

    return { act, root };
}
