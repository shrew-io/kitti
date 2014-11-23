var gulp = require('gulp');
var clean = require('gulp-clean');
var less = require('gulp-less');
var flatten = require('gulp-flatten');
var through2 = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var WebkitBuilder = require('node-webkit-builder');

gulp.task('clean', ['clean-dist', 'clean-build']);
gulp.task('prepare', ['clean', 'html', 'assets', 'js', 'less', 'manifest']);
gulp.task('run', ['prepare', 'development-exec']);
gulp.task('build', ['prepare', 'build-webkit']);
gulp.task('default', ['build']);

gulp.task('clean-build', function () {
	return gulp.src('build', {
			read: false
		})
		.pipe(clean({
			force: true
		}));
});

gulp.task('clean-dist', function () {
	return gulp.src('dist', {
			read: false
		})
		.pipe(clean({
			force: true
		}));
});

gulp.task('manifest', ['clean'], function () {
	var manifest = function manifest(opts) {
		opts = opts || {};

		return through2.obj(function (file, enc, next) {
			if (!file.isBuffer()) {
				this.emit('error', new PluginError('gulp-webkit-manifest', e));
			}

			var package = JSON.parse(file.contents);
			// modify package.json

			file.contents = new Buffer(JSON.stringify(package));
			this.push(file);
			next();
		});
	};

	return gulp.src('package.json')
		.pipe(manifest())
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
		files: './dist/**',
	});
	nw.run();
});

gulp.task('build-webkit', ['prepare'], function () {
	var nw = new WebkitBuilder({
		files: './dist/**',
		platforms: ['win', 'osx'],
		macIcns: './assets/images/icons/application.icns',
		winIco: './assets/images/icons/application.ico'
	});

	nw.build().then(function () {
		console.log('WebKit: build finished');
	}).catch(function (error) {
		console.error('WebKit: %s', error);
	});
});