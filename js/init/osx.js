exports = module.exports = function initialize(nw) {
	var win = nw.Window.get();
	var nativeMenuBar = new nw.Menu({
		type: "menubar"
	});
	nativeMenuBar.createMacBuiltin("Kitti");
	win.menu = nativeMenuBar;
};