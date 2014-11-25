requirejs.config({
	baseUrl: './lib',
	paths: {
		'app': '../js',
		'jquery': 'jquery/dist/jquery',
		'jquery-private': '../js/vendor/jquery-private'
	},
	map: {
		'*': {
			'jquery': 'jquery-private'
		},
		'jquery-private': {
			'jquery': 'jquery'
		}
	}
});