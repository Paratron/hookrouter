import React from 'react';
import isNode from './isNode';
import {setQueryParams} from './queryParams';
import {interceptRoute} from './interceptor';

let preparedRoutes = {};
let stack = {};
let componentId = 1;
let currentPath = isNode ? '' : location.pathname;
let basePath = '';
let basePathRegEx = null;

/**
 * Will define a base path that will be utilized in your routing and navigation.
 * To be called _before_ any routing or navigation happens.
 * @param {string} inBasepath
 */
export const setBasepath = (inBasepath) => {
	basePath = inBasepath;
	basePathRegEx = new RegExp('^' + basePath);
};

/**
 * Returns the currently used base path.
 * @returns {string}
 */
export const getBasepath = () => basePath;

const resolvePath = (inPath) => {
	if (isNode) {
		const url = require('url');
		return url.resolve(currentPath, inPath);
	}

	const current = new URL(currentPath, location.href);
	const resolved = new URL(inPath, current);
	return resolved.pathname;
};

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
		new RegExp(`${inRoute.substr(0, 1) === '*' ? '' : '^'}${inRoute.replace(/:[a-zA-Z]+/g, '([^/]+)').replace(/\*/g, '')}${inRoute.substr(-1,) === '*' ? '' : '$'}`)
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
 * @param {string} url The URL to navigate to. Do not mix adding GET params here and using the `getParams` argument.
 * @param {boolean} [replace=false] Should the navigation be done with a history replace to prevent back navigation by the user
 * @param {object} [queryParams] Key/Value pairs to convert into get parameters to be appended to the URL.
 */
export const navigate = (url, replace = false, queryParams = null) => {
	url = interceptRoute(currentPath, resolvePath(url));

	if (!url || url === currentPath) {
		return;
	}

	currentPath = url;

	if (isNode) {
		setPath(url);
		processStack();
		return;
	}

	const finalURL = basePathRegEx
		? url.match(basePathRegEx)
			? url
			: basePath + url
		:
		url;

	window.history[`${replace ? 'replace' : 'push'}State`](null, null, finalURL);
	processStack();

	if (queryParams) {
		setQueryParams(queryParams);
	}
};

let customPath = '/';
/**
 * Enables you to manually set the path from outside in a nodeJS environment, where window.history is not available.
 * @param {string} inPath
 */
export const setPath = (inPath) => {
	const url = require('url');
	customPath = url.resolve(customPath, inPath);
};

/**
 * Returns the current path of the router.
 * @returns {string}
 */
export const getPath = () => customPath;

/**
 * Called from within the router. This returns either the current windows url path
 * or a already reduced path, if a parent router has already matched with a finishing
 * wildcard before.
 * @param {string} [parentRouterId]
 * @returns {string}
 */
export const getWorkingPath = (parentRouterId) => {
	if (!parentRouterId) {
		return isNode ? customPath : window.location.pathname.replace(basePathRegEx, '') || '/';
	}
	const stackEntry = stack[parentRouterId];
	if (!stackEntry) {
		throw 'wth';
	}

	return stackEntry.reducedPath !== null ? stackEntry.reducedPath || '/' : window.location.pathname;
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
	const objAKeys = Object.keys(objA);
	const objBKeys = Object.keys(objB);

	const valueIsEqual = key => objB.hasOwnProperty(key) && objA[key] === objB[key];

	return (
		objAKeys.length === objBKeys.length
		&& objAKeys.every(valueIsEqual)
	);
};

if (!isNode) {
	window.addEventListener('popstate', (e) => {
		const nextPath = interceptRoute(currentPath, location.pathname);

		if (!nextPath || nextPath === currentPath) {
			e.preventDefault();
			e.stopPropagation();
			history.pushState(null, null, currentPath);
			return;
		}

		if (nextPath !== location.pathname) {
			history.replaceState(null, null, nextPath);
		}
		processStack();
	});
}

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

	const currentPath = getWorkingPath(parentRouterId);
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
	const [routerId] = React.useState('rtr_' + componentId++);
	const setUpdate = React.useState(0)[1];
	// Needed to create nested routers which use only a subset of the URL.
	const parentRouterId = React.useContext(ParentContext);

	// Removes the router from the stack after component unmount - it won't be processed anymore.
	React.useEffect(() => () => {
		delete stack[routerId];
	}, [routerId]);

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

	React.useDebugValue(stackObj.matchedRoute);

	if (!stackObj.matchedRoute) {
		return null;
	}

	const RouteContext = ({children}) => <ParentContext.Provider value={routerId}>{children}</ParentContext.Provider>;

	const originalResult = stackObj.resultFunc(stackObj.resultProps);
	let result = originalResult;

	const wrapper = function () {
		return (
			<RouteContext>{originalResult.apply(originalResult, arguments)}</RouteContext>
		);
	};

	if (typeof originalResult === 'function') {
		result = wrapper;
	}

	return stackObj.passContext && React.isValidElement(result) && result.type !== RouteContext
		? <RouteContext>{result}</RouteContext>
		: result;
};
