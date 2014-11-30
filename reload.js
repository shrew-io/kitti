require('chokidar').watch('.', {
	ignored: /[\/\\]\./
}).on('change', function (path) {
	window.location.reload();
});