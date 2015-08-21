var config = require('../lib/config');
var log = require('../lib/log');
var geohopper = require('../lib/geohopper');

exports.start = _start;
function _start(params){
	log.info('Starting Geohopper REST Endpoints');
	var app = params.app;
	app.post(config.get('GEOHOPPER_PUSH_URL'), function(req, res){
		log.info('POST: ' + config.get('GEOHOPPER_PUSH_URL'));
		var data = req.body;
		if (data) {
			geohopper.checkin(data);
		}
		res.end();
	});
};