import React from "react";
import {navigate} from "./router";

const A = (props) => {
	const {onClick: originalOnClick} = props;

	const onClick = (e) => {
		e.preventDefault();

		navigate(e.target.href);

		if (originalOnClick) {
			originalOnClick(e);
		}
	};

	return (
		<a {...props} onClick={onClick}/>
	);
};

export default A;
