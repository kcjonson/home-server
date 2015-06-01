var indigo = require('../lib/indigo');
var config = require('../../config/indigo.json');
var log = require('../lib/log');






exports.start = function(params){
	var app = params.app;
	log.info('Starting Indigo REST Endpoints');




// Listen for Events from Indigo

	app.post(config.API_URL + '/push', function(req,res){
		var data = req.body;
		log.info('POST: ' + config.API_URL + '/push', data);
		indigo.push(data);
		res.send();
	});
	

};


