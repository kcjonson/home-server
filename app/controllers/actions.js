var config = require('../../config/actions.json');
var devices = require('../lib/devices');
var log = require('../lib/log');
var Actions = require('../lib/actions');



exports.start = function(params) {
	log.info('Starting Actions REST Endpoints');	
	var app = params.app;

	app.get(config.ACTIONS_API_URL, function(req, res) {
		log.info('GET ' + config.ACTIONS_API_URL);
		Actions.get(function(err, actionsData){
			if (err) {res.send({error: err})}
			res.send(actionsData);
		});
	});

	app.post(config.ACTIONS_API_URL + '/execute/:id', function(req, res) {
		var id = req.params.id;
		log.info('POST ' + config.ACTIONS_API_URL + '/execute/' + id);
		Actions.execute(id, function(err) {
			if (err) {res.send({error: err})}
			res.send();
		});
	});

	app.patch(config.ACTIONS_API_URL + '/:id', function(req, res) {
		var id = req.params.id;
		log.info('PATCH ' + config.ACTIONS_API_URL + '/' + id);

		Actions.set(id, req.body, function(err, data) {
			if (err) {res.send({error: err})}
			res.send(data);
		});
	});

};


	