var fs = require('fs');

exports = module.exports = {};

exports.getModules = function (path) {
	var files = fs.readdirSync('./frontend/' + path);
	var modules = [];

	files.forEach(function (file) {
		if (file.indexOf('.') == 0 || file == 'index.js') {
			return;
		}
		file = file.substr(0, file.lastIndexOf('.'));
		modules.push(path + '/' + file);
	});

	return modules;
};