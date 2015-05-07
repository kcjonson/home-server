var config = require('../../config/devices.json');
var devices = require('../lib/devices');
var log = require('../lib/log');



exports.start = function(params) {
	
	var app = params.app;


	log.info('Starting Devices REST Endpoints');	




	app.get(config.DEVICES_API_URL, function(req, res) {
		log.info('GET ' + config.DEVICES_API_URL);
		devices.get(function(e, devicesData){
			res.send(devicesData);
		})
	});

	app.get(config.DEVICES_API_URL + '/:id', function(req, res) {
		var id = req.params.id;
		log.info('GET ' + config.DEVICES_API_URL + '/' + id);
		// TODO
		// devices.get(function(e, devicesData){
		// 	res.send(devicesData);
		// })
	});

	app.patch(config.DEVICES_API_URL + '/:id', function(req, res) {
		var id = req.params.id;
		var variableValue = req.body.value;
		log.info('PATCH ' + config.DEVICES_API_URL + '/' + id);
		devices.set(id, req.body, function(err){
			if (err) {res.send(err)} else {
				res.send();
			}
		});
	});
	
};


	