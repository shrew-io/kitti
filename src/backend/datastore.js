var nw = window.require('nw.gui');
var path = require('path');
var Datastore = require('nedb');
var db = new Datastore({
	filename: path.join(nw.App.dataPath, 'app.db'),
	autoload: true
});

exports = module.exports = db;