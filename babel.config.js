module.exports = function (api) {
	const presets = [];

	presets.push('@babel/preset-env');
	presets.push('@babel/preset-react');

	const plugins = [];

	api.cache(false);

	return {
		presets,
		plugins
	};
};
