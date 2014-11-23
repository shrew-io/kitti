var gulp = require('gulp');
var clean = require('gulp-clean');
var less = require('gulp-less');
var flatten = require('gulp-flatten');
var install = require('gulp-install');
var git = require('git-rev');
var zip = require('gulp-zip');
var q = require('q');
var package = require('./package.json');
var WebkitBuilder = require('node-webkit-builder');

var getBuildName = function getBuildName() {
	var deferred = q.defer();
	git.short(function (rev) {
		deferred.resolve(package.name + '-v' + package.version + '-' + rev);
	});
	return deferred.promise;
};

gulp.task('prepare', ['clean', 'html', 'assets', 'js', 'less', 'manifest']);
gulp.task('run', ['prepare', 'development-exec']);
gulp.task('build', ['prepare', 'prepare-webkit', 'build-webkit']);
gulp.task('package', ['build', 'package-windows', 'package-osx']);
gulp.task('default', ['build', 'package']);

gulp.task('prepare-webkit', ['prepare'], function () {
	return gulp.src('dist/package.json')
		.pipe(install({
			production: true
		}));
});

gulp.task('clean', function () {
	return gulp.src('dist', {
			read: false
		})
		.pipe(clean({
			force: true
		}));
});

gulp.task('manifest', ['clean'], function () {
	return gulp.src('package.json')
		.pipe(gulp.dest('dist'));
});

gulp.task('html', ['clean'], function () {
	return gulp.src('html/**', {
			base: './'
		})
		.pipe(flatten())
		.pipe(gulp.dest('dist'));
});

gulp.task('assets', ['clean'], function () {
	return gulp.src('assets/**', {
			base: './'
		})
		.pipe(gulp.dest('dist'));
});

gulp.task('js', ['clean'], function () {
	return gulp.src('js/**', {
			base: './'
		})
		.pipe(gulp.dest('dist'));
});

gulp.task('less', ['clean'], function () {
	return gulp.src('less/**/style.less')
		.pipe(less())
		.pipe(gulp.dest('dist/assets/css'));
});

gulp.task('development-exec', ['prepare'], function () {
	var nw = new WebkitBuilder({
		files: './dist/**'
	});
	nw.run();
});

gulp.task('build-webkit', ['prepare-webkit'], function () {
	var deferred = q.defer();

	getBuildName().then(function (buildName) {
		var nw = new WebkitBuilder({
			files: './dist/**',
			platforms: ['win', 'osx'],
			macIcns: './assets/images/icons/application.icns',
			winIco: './assets/images/icons/application.ico',
			buildType: function () {
				return buildName;
			}
		});

		nw.build().then(function () {
			deferred.resolve();
		}).catch(function (error) {
			console.error('WebKit: %s', error);
			deferred.reject();
		});
	});

	return deferred.promise;
});

gulp.task('package-windows', ['build'], function () {
	getBuildName().then(function (buildName) {
		var buildDirectory = 'build/' + buildName;
		gulp.src(buildDirectory + '/win/**')
			.pipe(zip(buildName + '-windows.zip'))
			.pipe(gulp.dest('build/' + buildName));
	});
});

gulp.task('package-osx', ['build'], function () {
	getBuildName().then(function (buildName) {
		var buildDirectory = 'build/' + buildName;
		gulp.src(buildDirectory + '/osx/**')
			.pipe(zip(buildName + '-osx.zip'))
			.pipe(gulp.dest('build/' + buildName));
	});
});