// eslint.config.js
import eslintPlugin from "@eslint/js";

export default [
	{
		files: ["**/*.js"],
		languageOptions: {
			ecmaVersion: 2020,
			globals: {
				console: "readonly",
				process: "readonly",
				module: "readonly",
				require: "readonly",
				__dirname: "readonly",
			},
		},
		plugins: {
			eslint: eslintPlugin,
		},
		rules: {
			"no-unused-vars": "warn",
			"no-undef": "error",
		},
	},
];
