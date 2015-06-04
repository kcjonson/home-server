var config = require('../../config/weather.json');
var weather = require('../lib/weather');
var log = require('../lib/log');

exports.start = function(params) {
	var app = params.app;
	log.info('Starting Weather REST Endpoints');
	app.get(config.WEATHER_API_URL, _handleGet);
	app.get(config.WEATHER_API_URL + '/:id', _handleGet);
};

function _handleGet(req, res) {
	var id = req.params.id;
	log.info('GET ' + config.WEATHER_API_URL + (id ? '/' + id : ''));
	weather.get(function(e, weatherData){
		if (e) {
			res.send({
				error: e
			})
		} else {
			res.send(weatherData);
		}
	})
};


	