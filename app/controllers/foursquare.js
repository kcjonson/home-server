var config = require('../../config/foursquare.json');
var appConfig  = require('../../config/app.json');

var foursquare = require('../lib/foursquare');



var STARTED = false;

exports.start = function(params){
	var app = params.app;
	console.log('Starting Foursquare REST Endpoints');

	if (!STARTED) {

		// Check Params
		var app = params.app;
		var hostname = params.hostname;


		// 	Listen for Checkins
		app.post(config.FOURSQUARE_PUSH_URL, function(req, res){
			var data = req.body;
			if (data && data.checkin) {
				foursquare.checkin(JSON.parse(data.checkin));
				//emit('checkin', JSON.parse(data.checkin));
			}
			res.end();
		});


		// Listen for Incomming Registration Requests
		app.get(config.FOURSQUARE_AUTHENTICATE_URL, function(req, res){
			//console.log('Request: \n', req);
			//console.log('\n Request Recieved: \n', req.query, req.query.code);
			if (req && req.query && req.query.code) {
				authenticateFoursquareUser(req.query.code)
			}
			res.end();
		});

		// Listen for Successful Authentication Responses
		// The user is redirected to this page.  For now, it's nothing.
		app.get(config.FOURSQUARE_AUTHENTICATE_SUCCESS_URL, function(req, res) {
			console.log(config.FOURSQUARE_AUTHENTICATE_SUCCESS_URL);
			res.end();
		});



		STARTED = true;

	}

};