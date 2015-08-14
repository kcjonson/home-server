var log = require('./lib/log');
var config = require('./lib/config');

// // Controllers (Handle Endpoints)
var users = require('./controllers/users');
var auth = require('./controllers/auth');
// var indigoController = require('./app/controllers/indigo');
// var foursquareController = require('./app/controllers/foursquare');
// var geohopperController = require('./app/controllers/geohopper');
// var alarmsController = require('./app/controllers/alarms');
// var devicesController = require('./app/controllers/devices');
// var nestController = require('./app/controllers/nest');
// var actionsController = require('./app/controllers/actions');
// var settingsController = require('./app/controllers/settings');
var collector = require('./controllers/collector'); 




module.exports = {
	attach: _attach
}


function _attach(params) {
	var app = params.app;
	
	auth.start({app: app});
	users.start({app: app});

	// Serve Weather Data
	if (config.get('WEATHER_API_ENABLED')) {
		var weather = require('./controllers/weather'); 
		weather.start({app: app});
	}

	// Servers static content for dashboard routes
	if (config.get('DASHBOARD_ENABLED')) {
		var dashboard = require('./controllers/dashboard');
		dashboard.start({app: app});
	}
	
	// Needs to be last since it serves as a proxy
	// to other endpoints.
	collector.start({app: app});

}