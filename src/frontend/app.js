define([
    'angular',
	'jquery',
    'controllers/index',
    'directives/index',
    'filters/index',
    'services/index'
], function (angular, $) {

	return angular.module('app', [
		'ui.router',
        'app.services',
        'app.controllers',
        'app.filters',
        'app.directives'
    ]);
});