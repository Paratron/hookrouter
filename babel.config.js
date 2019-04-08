module.exports = function (api) {
	// Resolve ES2015+ only before publishing to NPM
	if (process.env['NODE_ENV'] === 'production') {
		presets.push('@babel/preset-env');
	}

	presets.push('@babel/preset-react');

	const plugins = [];

	api.cache(false);

	return {
		presets,
		plugins
	};
};
