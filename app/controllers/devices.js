var config = require('../../config/devices.json');
var devices = require('../lib/devices');
var log = require('../lib/log');



exports.start = function(params) {
	
	var app = params.app;


	log.info('Starting Devices REST Endpoints');	


	// All Alarms

	app.get(config.DEVICES_API_URL, function(req, res) {
		log.info('GET ' + config.DEVICES_API_URL);
		devices.get(function(e, devicesData){
			res.send(devicesData);
		})
	});
	
};


	