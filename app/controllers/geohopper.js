var config = require('../../config/geohopper.json');
var appConfig  = require('../../config/app.json');
var log = require('../lib/log');

var geohopper = require('../lib/geohopper');



var STARTED = false;

exports.start = function(params){
	log.info('Starting Geohopper REST Endpoints');

	if (!STARTED) {
		var app = params.app;
		var hostname = params.hostname;

		// 	Listen for Events
		app.post(config.GEOHOPPER_PUSH_URL, function(req, res){
			log.info('POST: ' + config.GEOHOPPER_PUSH_URL);
			var data = req.body;
			if (data) {
				geohopper.checkin(data);
			}
			res.end();
		});
		STARTED = true;

	}

};