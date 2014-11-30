var manifest = require('./package.json');
var windows = require('./init/windows');
var osx = require('./init/osx');
var type = require('os').type();
var nw = window.require('nw.gui');

if (manifest.app && manifest.app.debug) {
	nw.Window.get().showDevTools();
}

if (type == 'Darwin') {
	osx(nw);
}

if (type == 'Windows_NT') {
	windows(nw);
}