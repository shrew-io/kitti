define([
    'angular',
	'require',
    'app',
    'routes'
], function (angular, require) {

	require(['domReady!'], function (document) {
		angular.bootstrap(document, ['app']);
	});
});