var windows = require('./init/windows');
var osx = require('./init/osx');
var type = require('os').type();
var nw = window.require('nw.gui');

if (type == 'Darwin') {
	osx(nw);
}

if (type == 'Windows_NT') {
	windows(nw);
}