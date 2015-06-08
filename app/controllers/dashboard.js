var config = require('../../config/dashboard.json');
var log = require('../lib/log');
var devices = require('../lib/devices');



exports.start = function(params) {
	var app = params.app;
	app.get(/\/server-remote-web(?!(?:\/scripts|\/styles|\/fonts|\/images|\/cordova.js))/, function(req, res) {
		res.render('../public/server-remote-web/dashboard.html');
	});
}


	