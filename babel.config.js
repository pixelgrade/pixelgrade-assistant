module.exports = function (api) {
	// api.cache(true);

	const env = api.env();

	const envOpts = {
		exclude: ["transform-typeof-symbol"],
		useBuiltIns: 'usage',
		corejs: 3,
	};

	const plugins = [
		"@babel/plugin-syntax-dynamic-import",
		"@babel/plugin-proposal-class-properties",
		"@babel/plugin-proposal-function-bind",
		"lodash",
	];

	switch (env) {
		case "production":
			plugins.push("transform-react-remove-prop-types");
			break;
		case "development":
			envOpts.debug = true;
			break;
	}

	const presets = [
		["@babel/preset-env", envOpts],
		"@babel/preset-react"
	];

	return {
		presets,
		plugins
	};
}
