module.exports = function (api) {
  const presets = [ "@babel/preset-env", "@babel/preset-react" ];
  const plugins = [ ];

  api.cache(false);

  return {
    presets,
    plugins
  };
};
