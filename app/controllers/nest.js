var config = require('../../config/nest.json');
var log = require('../lib/log');
var nest = require('../lib/devices/nest-thermostat');



var STARTED = false;

exports.start = function(params){
	var app = params.app;
	log.info('Starting Nest REST Endpoints');

	if (!STARTED) {

		// Check Params
		var app = params.app;
		var hostname = params.hostname;


		// Listen for Incomming Registration Requests
		app.get(config.NEST_AUTHENTICATE_URL, function(req, res){
			//console.log('Request: \n', req);
			//console.log('\n Request Recieved: \n', req.query, req.query.code);
			if (req && req.query && req.query.code) {
				nest.authenticate(req.query.code);
			}
			res.end();
		});

		STARTED = true;

	}

};