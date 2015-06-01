var config = require('../../config/dashboard.json');
var log = require('../lib/log');
var devices = require('../lib/devices');



exports.start = function(params) {
	
	var app = params.app;
	
	app.get(/\/server-remote-web(?!(?:\/scripts|\/styles|\/fonts|\/images|\/cordova.js))/, function(req, res) {
		//res.redirect('/dashboard.html');

		res.render('../public/server-remote-web/dashboard.html');

		// view.render(req, res, {
		// 	view: 'dashboard',
		// 	title: 'Home'
		// });
	});


	app.get(config.DASHBOARD_API_URL + '/push', function(req, res) {
		log.info('GET ' + config.DASHBOARD_API_URL + '/push');
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		});

		var writeDeviceData = function(deviceData){
			res.write("deviceData: " + JSON.stringify(deviceData) + "\n\n");
		};

		devices.events.on('change', writeDeviceData);

		req.on("close", function() {
			devices.events.removeListener('change', writeData);
		});

	});
	
}


	