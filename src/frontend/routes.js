define([
	'app'
], function (app) {

	app.config(function ($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise("/start");

		$stateProvider
			.state('start', {
				url: "/start",
				templateUrl: "partials/start.html"
			});
	});
});