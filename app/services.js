var log = require('./lib/log');
var config = require('./lib/config');







module.exports = {
	attach: _attach
}


function _attach(params) {
	var app = params.app;

	// Required 
	require('./controllers/auth').start({app: app});
	require('./controllers/users').start({app: app});
	require('./controllers/settings').start({app: app});
	require('./controllers/log').start({app: app});



	// APIs (outbound data)
	if (config.get('DEVICES_API_ENABLED')) {require('./controllers/devices').start({app: app});}
	if (config.get('ACTIONS_API_ENABLED')) {require('./controllers/actions').start({app: app});}
	if (config.get('ALARMS_ENABLED')) {require('./controllers/alarms').start({app: app});};
	if (config.get('ALARMS_API_ENABLED')) {require('./lib/alarms').start({app: app});}  // TODO? Move somewhere else?  Its not really an API...
	if (config.get('WEATHER_API_ENABLED')) {require('./controllers/weather').start({app: app});}
	if (config.get('DASHBOARD_ENABLED')) {require('./controllers/dashboard').start({app: app});}

	// Webservices (Inbound requests)
	if (config.get('INDIGO_WEBSERVICE_ENABLED')) {require('./controllers/indigo').start({app: app});};
	if (config.get('FOURSQUARE_WEBSERVICE_ENABLED')) {
		if (config.get('SERVER_SSL_ENABLED') === true) {
			require('./controllers/foursquare').start({app: app});
		} else {
			// Foursquare won't push to non secure endpoints.
			log.error('Foursquare webservice requires SSL to be enabled, unable to start endpoints');
		}
	};
	if (config.get('GEOHOPPER_WEBSERVICE_ENABLED')) {require('./controllers/geohopper').start({app: app});};
	require('./controllers/nest').start({app: app});


	// Collector
	// Needs to be last since it serves as a proxy
	// to other endpoints.
	require('./controllers/collector').start({app: app});

}