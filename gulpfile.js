var gulp = require('gulp');
var WebkitBuilder = require('node-webkit-builder');

gulp.task('dev', function () {
	var nw = new WebkitBuilder({
		files: './app/**',
	});

	nw.run();
});

gulp.task('webkit', function () {
	var nw = new WebkitBuilder({
		files: './app/**',
		platforms: ['win', 'osx'],
		macIcns: './dist/application.icns',
		winIco: './dist/application.ico'
	});

	nw.build().then(function () {
		console.log('WebKit: build finished');
	}).catch(function (error) {
		console.error('WebKit: %s', error);
	});
});

gulp.task('default', ['webkit']);