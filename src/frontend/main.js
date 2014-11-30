requirejs.config({
	baseUrl: './frontend',

	paths: {
		'domReady': '../lib/requirejs-domready/domReady',
		'angular': '../lib/angular/angular',
		'ui-router': '../lib/angular-ui-router/release/angular-ui-router',
		'angular-vendor': 'vendor/angular',
		'jquery': '../lib/jquery/dist/jquery',
		'bootstrap': '../lib/bootstrap/dist/js/bootstrap',
		'jquery-vendor': 'vendor/jquery'
	},

	shim: {
		'ui-router': ['angular'],
		'bootstrap': ['jquery']
	},

	map: {
		'*': {
			'angular': 'angular-vendor',
			'jquery': 'jquery-vendor'
		},

		'ui-router': {
			'angular': 'angular',
		},

		'bootstrap': {
			'jquery': 'jquery'
		},

		'angular-vendor': {
			'angular': 'angular'
		},

		'jquery-vendor': {
			'jquery': 'jquery'
		}
	},

	deps: ['./boot']
});