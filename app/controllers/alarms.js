var config = require('../../config/alarms.json');
var alarms = require('../lib/alarms');
var log = require('../lib/log');



exports.start = function(params) {
	
	var app = params.app;


	log.info('Starting Alarm REST Endpoints');	


	// All Alarms

	app.get(config.ALARM_API_URL, function(req, res) {
		log.info('GET ' + config.ALARM_API_URL);
		alarms.get(function(e, alarmsData){
			res.send(alarmsData);
		})
	});

	app.post(config.ALARM_API_URL, function(req, res) {
		log.info('POST ' + config.ALARM_API_URL);
		console.log(req.body);
	});

	app.patch(config.ALARM_API_URL, function(req, res) {
		log.info('PATCH ' + config.ALARM_API_URL);
	});





	// Single Alarm

	app.patch(config.ALARM_API_URL + '/:id', function(req, res) {
		var id = req.params.id;
		log.info('PATCH ' + config.ALARM_API_URL + '/:id', id);
		alarms.set(id, req.body, function(e, data){
			if (e) {
				log.error(e);
				res.send({
					error: e
				})
			} else {
				res.send(data);
			}
		})

	});

	
};


	