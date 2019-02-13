import React from 'react';

let preparedRoutes = {};
let stack = {};

export const ParentContext = React.createContext(null);

/**
 * Pass a route string to this function to receive a regular expression.
 * The transformation will be cached and if you pass the same route a second
 * time, the cached regex will be returned.
 * @param {string} inRoute
 * @returns {Array} [RegExp, propList]
 */
const prepareRoute = (inRoute) => {
    if (preparedRoutes[inRoute]) {
        return preparedRoutes[inRoute];
    }

    const preparedRoute = [
        new RegExp(`${inRoute.substr(0, 1) === '*' ? '' : '^'}${inRoute.replace(/:[a-zA-Z]+/g, '(.+?)').replace(/\*/g, '')}${inRoute.substr(-1,) === '*' ? '' : '$'}`)
    ];

    const propList = inRoute.match(/:[a-zA-Z]+/g);
    preparedRoute.push(
        propList
            ? propList.map(paramName => paramName.substr(1))
            : []
    );

    preparedRoutes[inRoute] = preparedRoute;
    return preparedRoute;
};

/**
 * Virtually navigates the browser to the given URL and re-processes all routers.
 * @param {string} url
 */
export const navigate = (url) => {
    window.history.pushState(null, null, url);
    processStack();
};

/**
 * Called from within the router. This returns either the current windows url path
 * or a already reduced path, if a parent router has already matched with a finishing
 * wildcard before.
 * @param {string} [parentRouterId]
 * @returns {string}
 */
export const getPath = (parentRouterId) => {
    if (!parentRouterId) {
        return window.location.pathname;
    }
    const stackEntry = stack[parentRouterId];
    if (!stackEntry) {
        throw 'wth';
    }
    return stackEntry.reducedPath || window.location.pathname;
};

const processStack = () => Object.keys(stack).forEach(process);

/**
 * This function takes two objects and compares if they have the same
 * keys and their keys have the same values assigned, so the objects are
 * basically the same.
 * @param {object} objA
 * @param {object} objB
 * @return {boolean}
 */
const objectsEqual = (objA, objB) => {
    const objAKeys = Object.keys(objA).sort();
    const objBKeys = Object.keys(objB).sort();

    if (objAKeys.length !== objBKeys.length) {
        return false;
    }

    for (let i = 0; i < objAKeys.length; i++) {
        if (objAKeys[i] !== objBKeys[i]) {
            return false;
        }
        const key = objAKeys[i];

        if (objAKeys[key] !== objBKeys[key]) {
            return false;
        }
    }
    return true;
};

window.addEventListener('popstate', processStack);

const emptyFunc = () => null;

/**
 * This will calculate the match of a given router.
 * @param routerId
 */
const process = (routerId) => {
    const {
        parentRouterId,
        routes,
        setUpdate,
        resultFunc,
        resultProps,
        reducedPath: previousReducedPath
    } = stack[routerId];

    const currentPath = getPath(parentRouterId);
    let route = null;
    let targetFunction = null;
    let targetProps = null;
    let reducedPath = null;
    let anyMatched = false;

    for (let i = 0; i < routes.length; i++) {
        [route, targetFunction] = routes[i];
        const [regex, groupNames] = preparedRoutes[route]
            ? preparedRoutes[route]
            : prepareRoute(route);

        const result = currentPath.match(regex);
        if (!result) {
            targetFunction = emptyFunc;
            continue;
        }

        if (groupNames.length) {
            targetProps = {};
            for (let j = 0; j < groupNames.length; j++) {
                targetProps[groupNames[j]] = result[j + 1];
            }
        }

        reducedPath = currentPath.replace(result[0], '');
        anyMatched = true;
        break;
    }

    if (!stack[routerId]) {
        return;
    }

    if (!anyMatched) {
        route = null;
        targetFunction = null;
        targetProps = null;
        reducedPath = null;
    }

    const funcsDiffer = resultFunc !== targetFunction;
    const pathDiffer = reducedPath !== previousReducedPath;
    let propsDiffer = true;

    if (!funcsDiffer) {
        if (!resultProps && !targetProps) {
            propsDiffer = false;
        } else {
            propsDiffer = !(resultProps && targetProps && objectsEqual(resultProps, targetProps) === true);
        }

        if (!propsDiffer) {
            if (!pathDiffer) {
                return;
            }
        }
    }

    Object.assign(stack[routerId], {
        resultFunc: targetFunction,
        resultProps: targetProps,
        reducedPath,
        matchedRoute: route,
        passContext: route ? route.substr(-1) === '*' : false
    });

    if (funcsDiffer || propsDiffer) {
        setUpdate(Date.now());
    }
};

/**
 * Pass an object to this function where the keys are routes and the values
 * are functions to be executed when a route matches. Whatever your function returns
 * will be returned from the hook as well into your react component. Ideally you would
 * return components to be rendered when certain routes match, but you are not limited
 * to that.
 * @param {object} routeObj {"/someRoute": () => <Example />}
 */
export const useRoutes = (routeObj) => {
    // Each router gets an internal id to look them up again.
    const [routerId] = React.useState(Math.random().toString());
    // This will be called when the URL has changed and the router does not match
    // anymore. It triggers a re-render of the component using this hook.
    const setUpdate = React.useState(0)[1];
    // Needed to create nested routers which use only a subset of the URL.
    const parentRouterId = React.useContext(ParentContext);

    React.useEffect(() => {
        const s = stack[routerId];
        if (s) {
            clearTimeout(s.deathTimer);
        }
        return () => {
            s.deathTimer = setTimeout(() => {
                delete stack[routerId];
            }, 100);
        };
    });

    let stackObj = stack[routerId];

    if (!stackObj) {
        stackObj = {
            routerId,
            routes: Object.entries(routeObj),
            setUpdate,
            parentRouterId,
            matchedRoute: null,
            reducedPath: null,
            resultFunc: null,
            passContext: false,
            resultProps: {},
            deathTimer: null,
        };

        stack[routerId] = stackObj;

        process(routerId);
    }

    if (!stackObj.matchedRoute) {
        return null;
    }

    const result = stackObj.resultFunc(stackObj.resultProps);

    return stackObj.passContext
        ? <ParentContext.Provider value={routerId}>{result}</ParentContext.Provider>
        : result;
};
