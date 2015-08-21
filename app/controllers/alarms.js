var config = require('../lib/config');
var alarms = require('../lib/alarms');
var log = require('../lib/log');
var collector = require('./collector');


exports.start = function(params) {
	
	var app = params.app;


	log.info('Starting Alarm REST Endpoints');	


	// All Alarms
	collector.registerEndpoint(config.get('ALARMS_API_URL'));
	app.get(config.get('ALARMS_API_URL'), function(req, res) {
		log.info('GET ' + config.get('ALARMS_API_URL'));
		alarms.get(function(e, alarmsData){
			res.send(alarmsData);
		})
	});
	app.get(config.get('ALARMS_API_URL') + '/push', _handlePush);

	app.post(config.get('ALARMS_API_URL'), function(req, res) {
		log.info('POST ' + config.get('ALARMS_API_URL'));
	});

	app.patch(config.get('ALARMS_API_URL'), function(req, res) {
		log.info('PATCH ' + config.get('ALARMS_API_URL'));
	});





	// Single Alarm

	app.patch(config.get('ALARMS_API_URL') + '/:id', function(req, res) {
		var id = req.params.id;
		log.info('PATCH ' + config.get('ALARMS_API_URL') + '/:id', id);
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


function _handlePush(req, res) {
	log.info('GET ' + config.get('ALARMS_API_URL') + '/push');
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	});
	// var writeData = function(devicesData){
	// 	res.write("data: " + JSON.stringify(devicesData) + "\n\n");
	// };
	// devices.events.on('change', writeData);
	// req.on("close", function() {
	// 	devices.events.removeListener('change', writeData);
	// });
}

	