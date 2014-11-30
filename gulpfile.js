var gulp = require('gulp');
var install = require('gulp-install');
var WebkitBuilder = require('node-webkit-builder');
var git = require('git-rev');
var fsx = require('fs-extra');
var npm = require("npm");
var os = require('os');
var q = require('q');
var recess = require('recess');
var manifest = require('./package.json');
var temp = 'build/temp';

/* Helper
 ****************** */

var copy = function copy() {
	var deferred = q.defer();

	fsx.removeSync(temp);
	fsx.copySync('./src', temp + '/');
	fsx.removeSync(temp + '/less');

	recess(['./src/less/style.less'], {
		compile: true
	}, function (err, obj) {
		if (err) {
			throw err;
		}

		fsx.outputFileSync(temp + '/assets/css/style.css', obj.data);
		deferred.resolve();
	});

	return deferred.promise;
};

var getBuild = function getBuild() {
	var deferred = q.defer();
	git.short(function (rev) {
		var name = manifest.name + '-v' + manifest.version + '.' + rev;
		deferred.resolve({
			appName: manifest.name,
			name: name,
			path: 'build/' + name
		});
	});
	return deferred.promise;
};

/* Chained tasks
 ****************** */

gulp.task('run', ['prepare-run', 'webkit-run']);
gulp.task('build', ['prepare-build', 'webkit-build']);
gulp.task('package', ['build', 'package-windows', 'package-osx']);
gulp.task('default', ['build', 'package']);


/* Prepare
 ****************** */

gulp.task('copy', function () {
	return copy();
});

gulp.task('prepare-run', ['copy', 'dependencies'], function () {
	manifest.window.toolbar = true;
	fsx.writeJsonSync(temp + '/package.json', manifest);
});

gulp.task('prepare-build', ['copy', 'dependencies'], function () {
	fsx.writeJsonSync(temp + '/package.json', manifest);
});

gulp.task('dependencies', ['copy'], function () {
	return gulp.src(['bower.json', 'package.json'])
		.pipe(gulp.dest(temp))
		.pipe(install({
			production: true
		}));
});

/* Execute / Build
 ****************** */

gulp.task('webkit-run', ['prepare-run'], function () {
	var deferred = q.defer();

	var nw = new WebkitBuilder({
		files: temp + '/**'
	});

	return nw.run(function () {
		console.log('App: Exited');
	});
});

gulp.task('webkit-build', ['prepare-build'], function () {
	var deferred = q.defer();

	getBuild().then(function (build) {
		fsx.removeSync(build.path);

		var nw = new WebkitBuilder({
			files: temp + '/**',
			platforms: ['win', 'osx'],
			macIcns: './src/assets/images/icons/application.icns',
			winIco: './src/assets/images/icons/application.ico',
			buildType: function () {
				return build.name;
			}
		});

		nw.build().then(function () {
			deferred.resolve();
		}).catch(function (error) {
			console.error('WebKit Error: %s', error);
			throw {
				error: 'WebKit',
				message: error
			}
		});
	});

	return deferred.promise;
});

/* Package
 ****************** */

gulp.task('package-windows', ['build'], function () {
	var deferred = q.defer();

	getBuild().then(function (build) {
		// TODO
	});

	return deferred.promise;
});

gulp.task('package-osx', ['build'], function () {
	var isOsx = os.type() == 'Darwin';
	if (!isOsx) {
		console.log('Warning: Skipping OSX build');
		return;
	}

	var deferred = q.defer();

	npm.load(manifest, function (err) {
		npm.commands.install(["appdmg"], function (error, data) {
			if (error) {
				throw error;
			}

			var appdmg = require('appdmg');
			getBuild().then(function (build) {
				fsx.copySync('dist/background.png', build.path + '/background.png');

				var appName = build.appName;
				var fileName = 'osx/' + build.appName + '.app';
				var osx = {
					'title': appName,
					'icon': 'assets/images/icons/application.icns',
					'background': 'background.png',
					'icon-size': 80,
					'contents': [{
						'x': 100,
						'y': 100,
						'type': 'link',
						'path': '/Applications'
            			}, {
						'x': 250,
						'y': 100,
						'type': 'file',
						'path': fileName
            		}]
				};

				fsx.writeJsonSync(build.path + '/osx.json', osx);

				var dmgFile = build.name + '.dmg';
				var dmg = appdmg(build.path + '/osx.json', build.path + '/' + dmgFile);

				var removeTemp = function () {
					fsx.removeSync(build.path + '/osx.json');
					fsx.removeSync(build.path + '/background.png');
				};

				dmg.on('finish', function () {
					console.log('Created: %s', dmgFile);
					removeTemp();
					deferred.resolve();
				});

				dmg.on('error', function (error) {
					console.error('DMG Error: %s', error);
					removeTemp();
					deferred.reject();
				});
			});
		});

		npm.on("log", function (message) {
			console.log(message);
		});
	});

	return deferred.promise;
});