var config = require('../lib/config');
var log = require('../lib/log');






exports.start = function(params){
	var app = params.app;
	log.info('Starting Log REST Endpoints');


	app.post(config.get('LOG_API_URL'), function(req,res){
		var data = req.body;
		log.info('POST: ' + config.get('LOG_API_URL'));
		if (log[data.level] && typeof log[data.level] === 'function') {
			log[data.level](data);
		}
		res.send({});
	});

};