import React from 'react';
import isNode from './isNode';

let currentTitle = '';

/**
 * This hook will set the window title, when a component gets mounted.
 * When the component gets unmounted, the previously used title will be restored.
 * @param {string} inString
 */
export const useTitle = (inString) => {
	currentTitle = inString;

	if(isNode){
		return;
	}

	React.useEffect(() => {
		const previousTitle = document.title;
		document.title = inString;
		return () => {
			document.title = previousTitle;
		};
	});
};

/**
 * Returns the current window title to be used in a SSR context
 * @returns {string}
 */
export const getTitle = () => currentTitle;
