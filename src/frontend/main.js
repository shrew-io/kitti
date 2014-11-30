requirejs.config({
	baseUrl: './frontend',

	paths: {
		'domReady': '../lib/requirejs-domready/domReady',
		'angular': '../lib/angular/angular',
		'ui-router': '../lib/angular-ui-router/release/angular-ui-router',
		'angular-vendor': 'vendor/angular'
	},

	shim: {
		'ui-router': ['angular']
	},

	map: {
		'*': {
			'angular': 'angular-vendor'
		},

		'ui-router': {
			'angular': 'angular',
		},

		'angular-vendor': {
			'angular': 'angular',
		},
	},

	deps: ['./bootstrap']
});