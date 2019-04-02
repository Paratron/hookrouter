import React from 'react';
import isNode from './isNode';

export const useTitle = (inString) => {
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
