var config = require('../lib/config');
var weather = require('../lib/weather');
var log = require('../lib/log');
var collector = require('./collector');

exports.start = function(params) {
	var app = params.app;
	log.info('Starting Weather REST Endpoints');
	collector.registerEndpoint(config.get('WEATHER_API_URL'));
	app.get(config.get('WEATHER_API_URL'), _handleGet);
	app.get(config.get('WEATHER_API_URL') + '/push', _handlePush);
	app.get(config.get('WEATHER_API_URL') + '/:id', _handleGet);
};

function _handleGet(req, res) {
	var id = req.params.id;
	log.info('GET ' + config.get('WEATHER_API_URL') + (id ? '/' + id : ''));
	weather.get(function(e, weatherData){
		if (e) {
			log.error(e);
			res.send({
				error: e
			})
		} else {
			res.send(weatherData);
		}
	})
};

function _handlePush(req, res) {
	log.info('GET ' + config.get('WEATHER_API_URL') + '/push');
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	});
	res.connection.setTimeout(0);
	// var writeData = function(devicesData){
	// 	res.write("data: " + JSON.stringify(devicesData) + "\n\n");
	// };
	// devices.events.on('change', writeData);
	// req.on("close", function() {
	// 	devices.events.removeListener('change', writeData);
	// });
}


	