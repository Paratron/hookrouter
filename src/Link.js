import React from "react";
import {navigate, getBasepath} from "./router";

const A = (props) => {
	const {onClick: originalOnClick} = props;
	const basePath = getBasepath();

	const onClick = (e) => {
		e.preventDefault();

		navigate(e.currentTarget.href);

		if (originalOnClick) {
			originalOnClick(e);
		}
	};

	const href = props.href.substr(0, 1) === '/'
		? basePath + props.href
		: props.href;

	return (
		<a {...props} href={href} onClick={onClick}/>
	);
};

export default A;
