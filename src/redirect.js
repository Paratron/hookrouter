import React from 'react';
import {navigate, ParentContext, getWorkingPath} from './router';

const useRedirect = (fromURL, toURL, queryParams = null, replace = true) => {
	const parentRouterId = React.useContext(ParentContext);
	const currentPath = getWorkingPath(parentRouterId);

	if (currentPath === fromURL) {
		navigate(parentRouterId ? `.${toURL}` : toURL, replace, queryParams);
	}
};

export default useRedirect;
