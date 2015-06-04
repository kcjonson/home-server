var config = require('../../config/weather.json');
var settings = require('./settings');
var ForecastIO = require('forecastio');
var log = require('../lib/log');

exports.get = _get;

var forecast = new ForecastIO(config.FORECAST_API_KEY);
var forecastOptions = {
	exclude: 'minutely, flags'
}

function _get(params, callback) {
	if (typeof params == 'function' && !callback) {
		callback = params;
		params = undefined;
	}
	settings.get(function(e, settingsData){
		var lat = settingsData.coordinates[1];
		var lng = settingsData.coordinates[0];

		forecast.forecast(lat, lng, forecastOptions, function(err, weather) {
			if(err) callback(err)
			callback(null, weather)
		});
	});
	
}

