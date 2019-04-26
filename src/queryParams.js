import React from 'react';
import isNode from './isNode';

const queryParamListeners = [];
let queryParamObject = {};

export const setQueryParams = (inObj, replace = false) => {
	if(!(inObj instanceof Object)){
		throw new Error('Object required');
	}
	if(replace){
		queryParamObject = inObj;
	} else {
		Object.assign(queryParamObject, inObj);
	}
	const now = Date.now();
	queryParamListeners.forEach(cb => cb(now));
	if (!isNode) {
		const qs = '?' + objectToQueryString(queryParamObject);
		if(qs === location.search) {
			return;
		}
		history.replaceState(null, null, location.pathname + (qs !== '?' ? qs : ''));
	}
};

export const getQueryParams = () => Object.assign({}, queryParamObject);

/**
 * This takes an URL query string and converts it into a javascript object.
 * @param {string} inStr
 * @return {object}
 */
const queryStringToObject = (inStr) => {
	const p = new URLSearchParams(inStr);
	let result = {};
	for (let param of p) {
		result[param[0]] = param[1];
	}
	return result;
};

/**
 * This takes a javascript object and turns it into a URL query string.
 * @param {object} inObj
 * @return {string}
 */
const objectToQueryString = (inObj) => {
	const qs = new URLSearchParams();
	Object.entries(inObj).forEach(([key, value]) => value !== undefined ? qs.append(key, value) : null);
	return qs.toString();
};

if(!isNode){
	queryParamObject = queryStringToObject(location.search.substr(1));
}

/**
 * This hook returns the currently set query parameters as object and offers a setter function
 * to set a new query string.
 *
 * All components that are hooked to the query parameters will get updated if they change.
 * Query params can also be updated along with the path, by calling `navigate(url, queryParams)`.
 *
 * @returns {array} [queryParamObject, setQueryParams]
 */
export const useQueryParams = () => {
	const setUpdate = React.useState(0)[1];

	React.useEffect(() => {
		queryParamListeners.push(setUpdate);

		return () => {
			const index = queryParamListeners.indexOf(setUpdate);
			if (index === -1) {
				return;
			}
			queryParamListeners.splice(index, 1);
		};
	}, [setUpdate]);

	return [queryParamObject, setQueryParams];
};
