import React from "react";
import {navigate, getBasepath} from "./router";

/**
 * Accepts HTML `a`-tag properties, requiring `href` and optionally
 * `onClick`, which are appropriately wrapped to allow other
 * frameworks to be used for creating `hookrouter` navigatable links.
 *
 * If `onClick` is supplied, then the navigation will happen before
 * the supplied `onClick` action!
 *
 * @example
 *
 * &lt;MyFrameworkLink what="ever" {...useLink({ href: '/' })}&gt;
 *   Link text
 * &lt;/MyFrameworkLink&gt;
 *
 * @param {Object} props Requires `href`. `onClick` is optional.
 */
export const setLinkProps = (props) => {
	const onClick = (e) => {
		if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
			e.preventDefault(); // prevent the link from actually navigating
			navigate(e.currentTarget.attributes["href"]);
		}

		if (props.onClick) {
			props.onClick(e);
		}
	};
	const href =
		props.href.substr(0, 1) === '/'
			? getBasepath() + props.href
			: props.href;

	return {...props, href, onClick};
};

/**
 * Accepts standard HTML `a`-tag properties. `href` and, optionally,
 * `onClick` are used to create links that work with `hookrouter`.
 *
 * @example
 *
 * &lt;A href="/" target="_blank"&gt;
 *   Home
 * &lt;/A&gt;
 *
 * @param {Object} props Requires `href`. `onClick` is optional
 */
export const A = (props) => <a {...setLinkProps(props)} />;
