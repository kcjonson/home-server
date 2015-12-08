var config = require('../lib/config');
var log = require('../lib/log');
var foursquare = require('../lib/foursquare');


exports.start = function(params){
	var app = params.app;
	log.info('Starting Foursquare REST Endpoints');

	// Check Params
	var app = params.app;
	var hostname = params.hostname;

	// 	Listen for Checkins
	app.post(config.get('FOURSQUARE_PUSH_URL'), function(req, res){
		log.info('POST ' + config.get('FOURSQUARE_PUSH_URL'));
		var data = req.body;
		if (data && data.checkin) {
			foursquare.checkin(JSON.parse(data.checkin));
			//emit('checkin', JSON.parse(data.checkin));
		}
		res.end();
	});


	// Listen for Incomming Registration Requests
	app.get(config.get('FOURSQUARE_AUTHENTICATE_URL'), function(req, res){
		//log.info('Request: \n', req);
		//log.info('\n Request Recieved: \n', req.query, req.query.code);
		if (req && req.query && req.query.code) {
			authenticateFoursquareUser(req.query.code)
		}
		res.end();
	});

	// Listen for Successful Authentication Responses
	// The user is redirected to this page.  For now, it's nothing.
	app.get(config.get('FOURSQUARE_AUTHENTICATE_SUCCESS_URL'), function(req, res) {
		log.info(config.get('FOURSQUARE_AUTHENTICATE_SUCCESS_URL'));
		res.end();
	});




};