import React from 'react';
import {useInterceptor} from "./interceptor";
import {navigate} from "./router";

/**
 * This is a controlled version of the interceptor which cancels any navigation intent
 * and hands control over it to your calling component.
 *
 * `interceptedPath` is initially `null` and will be set to the target path upon navigation.
 * `confirmNavigation` is the callback to be called to stop the interception and navigate to the last path.
 * `resetPath` is a callback that resets `interceptedPath` back to `null`.
 *
 * @returns {Array} [interceptedPath, confirmNavigation, resetPath]
 */
export const useControlledInterceptor = () => {
	const [interceptedPath, setInterceptedPath] = React.useState(null);

	const interceptorFunction = React.useMemo(
		() => (currentPath, nextPath) => {
			setInterceptedPath(nextPath);
			return currentPath;
		},
		[setInterceptedPath]
	);

	const stopInterception = useInterceptor(interceptorFunction);

	const confirmNavigation = React.useMemo(
		() => () => {
			stopInterception();
			navigate(interceptedPath);
		},
		[stopInterception, interceptedPath]
	);

	const resetPath = React.useMemo(
		() => () => setInterceptedPath(null),
		[setInterceptedPath]
	);

	return [interceptedPath, confirmNavigation, resetPath, stopInterception];
};
