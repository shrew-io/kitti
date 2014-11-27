var gulp = require('gulp');
var less = require('gulp-less');
var install = require('gulp-install');
var git = require('git-rev');
var os = require('os');
var q = require('q');
var fsx = require('fs-extra');
var package = require('./package.json');
var WebkitBuilder = require('node-webkit-builder');
var npm = require("npm");
var date = Date.now();
var temp = 'build/temp';

var getBuild = function getBuild() {
    var deferred = q.defer();
    git.short(function (rev) {
        var name = package.name + '-v' + package.version + '-' + rev + '-' + date;
        deferred.resolve({
            appName: package.name,
            name: name,
            path: 'build/' + name
        });
    });
    return deferred.promise;
};

gulp.task('prepare', ['clean', 'copy', 'less']);
gulp.task('run', ['prepare', 'development-exec']);
gulp.task('build', ['prepare', 'prepare-webkit', 'build-webkit']);
gulp.task('package', ['build', 'package-windows', 'package-osx']);
gulp.task('default', ['build', 'package']);

gulp.task('prepare-webkit', ['prepare'], function () {
    return gulp.src('build/temp/package.json')
        .pipe(install({
            production: true
        }));
});

gulp.task('clean', function () {
    var deferred = q.defer();

    getBuild().then(function (build) {
        fsx.remove('build/temp', function (err) {
            console.log('Cleaned directories');
            deferred.resolve();
        });
    });

    return deferred.promise;
});

gulp.task('copy', ['clean'], function () {
    fsx.copySync('package.json', temp + '/package.json');
    fsx.copySync('src', temp + '/');
    fsx.removeSync(temp + '/less');
});

gulp.task('less', ['clean'], function () {
    return gulp.src('less/**/style.less')
        .pipe(less())
        .pipe(gulp.dest('build/temp/assets/css'));
});

gulp.task('development-exec', ['prepare'], function () {
    package.window.toolbar = true;
    fsx.writeJsonSync(temp + '/package.json', package);
    var nw = new WebkitBuilder({
        files: './build/temp/**'
    });
    nw.run();
});

gulp.task('build-webkit', ['prepare-webkit'], function () {
    var deferred = q.defer();

    getBuild().then(function (build) {
        fsx.writeJsonSync(temp + '/package.json', package);

        var nw = new WebkitBuilder({
            files: './build/temp/**',
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

gulp.task('package-windows', ['build'], function () {
    var deferred = q.defer();

    getBuild().then(function (build) {
        // TODO
        //console.log('Created: %s', zipFile);
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

    npm.load(package, function (err) {
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