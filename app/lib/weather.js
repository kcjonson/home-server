var config = require('./config');
var settings = require('./settings');
var ForecastIO = require('forecastio');
var log = require('../lib/log');

exports.get = _get;

// TODO: Only create Forecast object on first request

if (!config.get('WEATHER_FORECAST_API_KEY')) {
	log.error('Unable to get Forecast API Key from Config, Exiting.')
	process.exit();
}


function _get(params, callback) {
	if (typeof params == 'function' && !callback) {
		callback = params;
		params = undefined;
	}

	if (!connection) {
		var connection = new ForecastIO(config.get('WEATHER_FORECAST_API_KEY'));
	}

	settings.get(function(e, settingsData){
		if (e) {
			log.error(e);
			callback('Error getting weather: Unable to get settings');
			return;
		}
		if (settingsData && settingsData.coordinates) {
			var lat = settingsData.coordinates[1];
			var lng = settingsData.coordinates[0];
			var forecastOptions = {
				exclude: 'minutely, flags'
			}
			connection.forecast(lat, lng, forecastOptions, function(err, weather) {
				if(err) callback(err)
				callback(null, weather)
			});
		} else {
			callback(log.error('Error getting weather: Settings must have coordinates set'))
		}
	});
	
}

