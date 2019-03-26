import React from 'react';
import {navigate, ParentContext, getWorkingPath} from './router';

const useRedirect = (fromURL, toURL, queryParams) => {
	const parentRouterId = React.useContext(ParentContext);
	const currentPath = getWorkingPath(parentRouterId);

	if (currentPath === fromURL) {
		navigate(parentRouterId ? `.${toURL}` : toURL, queryParams);
	}
};

export default useRedirect;
