var config = require('../../config/geohopper.json');
var appConfig  = require('../../config/app.json');

var geohopper = require('../lib/geohopper');



var STARTED = false;

exports.start = function(params){
	console.log('Starting Geohopper REST Endpoints');

	if (!STARTED) {
		var app = params.app;
		var hostname = params.hostname;

		// 	Listen for Events
		app.post(config.GEOHOPPER_PUSH_URL, function(req, res){
			console.log('Geohopper Push Recieved');
			var data = req.body;
			if (data) {
				geohopper.checkin(data);
			}
			res.end();
		});
		STARTED = true;

	}

};