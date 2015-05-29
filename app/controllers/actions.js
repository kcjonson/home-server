var config = require('../../config/actions.json');
var devices = require('../lib/devices');
var log = require('../lib/log');
var Actions = require('../lib/actions');




var ACTIONS = [
	{
		name: 'Turn Off All Lights',
		_id: 1,
		isEnabled: function(callback) {
			callback(true);
		},
		execute: function(callback) {
			var numToTurnOff = 0;
			var numTurnedOff = 0;
			devices.get(function(err, devicesData){
				devicesData.forEach(function(deviceData){
					if (deviceData.type == 'INDIGO_DIMMER') {
						numToTurnOff += 1;
						devices.set(deviceData._id, {brightness: 0}, function(err){
							numTurnedOff += 1;
							if (numTurnedOff == numToTurnOff) {
								callback();
							}
						});
					}
				});
			});
		}
	},
	{
		name: 'Set Movie Mood',
		_id: 2,
		isEnabled: function(callback) {
			callback(true);
		},
		execute: function(callback) {
			var lightsToDim = [
				'Entry Wall Sconce',
				'TV Room Overhead Lights'
			];

			var numFound = 0;
			var numUpdated = 0;
			devices.get(function(err, devicesData){
				devicesData.forEach(function(deviceData){
					if (deviceData.type == 'INDIGO_DIMMER') {
						if (lightsToDim.indexOf(deviceData.name) > -1) {
							numFound += 1;
							devices.set(deviceData._id, {brightness: 40}, function(err){
								numUpdated += 1;
								if (numUpdated == numFound) {
									callback();
								}
							});
						}
					}
				});
			});
		}
	},
	{
		name: 'Set Bedtime Mood',
		_id: 3,
		isEnabled: function(callback) {
			callback(true);
		},
		execute: function(callback) {

			var lightsToDim = [
				'Master Bathroom Overhead Lights',
				'Master Bathroom Vanity Lights',
				'Master Bedroom Overhead Lights'
			];

			var numFound = 0;
			var numUpdated = 0;
			devices.get(function(err, devicesData){
				devicesData.forEach(function(deviceData){
					if (deviceData.type == 'INDIGO_DIMMER') {
						numFound += 1;
						var brightness = 0;
						if (lightsToDim.indexOf(deviceData.name) > -1) {
							brightness = 40;
						}
						devices.set(deviceData._id, {brightness: brightness}, function(err){
							numUpdated += 1;
							if (numUpdated == numFound) {
								callback();
							}
						});
					}
				});
			});
		}
	}
];



exports.start = function(params) {
	
	var app = params.app;


	log.info('Starting Actions REST Endpoints');	




	app.get(config.ACTIONS_API_URL, function(req, res) {
		log.info('GET ' + config.ACTIONS_API_URL);

		Actions.get(function(err, actionsData){
			if (err) {res.send({error: err})}
			res.send(actionsData);
		});

		// var actionsData = [];
		// var actionsPolled = 0;
		// ACTIONS.forEach(function(ACTION){
		// 	ACTION.isEnabled(function(isEnabled){
		// 		actionsData.push({
		// 			name: ACTION.name,
		// 			_id: ACTION._id,
		// 			isEnabled: isEnabled
		// 		})
		// 		actionsPolled += 1;
		// 		if (actionsPolled == ACTIONS.length) {
		// 			res.send(actionsData);
		// 		}
		// 	})
		// });

	});

	app.post(config.ACTIONS_API_URL + '/execute/:id', function(req, res) {
		var id = req.params.id;
		log.info('POST ' + config.ACTIONS_API_URL + '/execute/' + id);


		Actions.execute(id, function(err) {
			if (err) {res.send({error: err})}
			res.send();
		});

		// var actionFound = false;
		// ACTIONS.forEach(function(ACTION){
		// 	if (ACTION._id == id) {
		// 		actionFound = true;
		// 		log.info('Executing action: ', ACTION.name);
		// 		ACTION.execute(function(err){
		// 			res.send(err);
		// 		})
		// 	}
		// });
		// if (!actionFound) {
		// 	res.send({
		// 		error: 'Action ' + id + 'does not exist'
		// 	})
		// };
	});

	// app.patch(config.DEVICES_API_URL + '/:id', function(req, res) {
	// 	var id = req.params.id;
	// 	var variableValue = req.body.value;
	// 	log.info('PATCH ' + config.DEVICES_API_URL + '/' + id);
	// 	devices.set(id, req.body, function(err){
	// 		if (err) {res.send(err)} else {
	// 			res.send();
	// 		}
	// 	});
	// });
	
};


	