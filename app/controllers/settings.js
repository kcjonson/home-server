var config = require('../../config/settings.json');
var settings = require('../lib/settings');
var log = require('../lib/log');
var collector = require('./collector');


exports.start = function(params) {
	
	var app = params.app;


	log.info('Starting Settings REST Endpoints');	


	// All Settings
	collector.registerEndpoint(config.SETTINGS_API_URL);
	app.get(config.SETTINGS_API_URL, _handleGet);
	app.get(config.SETTINGS_API_URL + '/push', _handlePush);
	app.get(config.SETTINGS_API_URL + '/:id', _handleGet);
	
	app.patch(config.SETTINGS_API_URL, _handlePatch);
	app.patch(config.SETTINGS_API_URL + '/:id', _handlePatch);


};


function _handleGet(req, res) {
	var id = req.params.id;
	log.info('GET ' + config.SETTINGS_API_URL + (id ? '/' + id : ''));
	settings.get(function(e, settingsData){
		if (e) {
			res.send({
				error: e
			})
		} else {
			res.send(settingsData);
		}
	})
};

function _handlePatch(req, res) {
	var id = req.params.id;
	log.info('PATCH ' + config.SETTINGS_API_URL + (id ? '/' + id : ''));
	settings.set(req.body, function(e, settingsData){
		if (e) {
			res.send({
				error: e
			})
		} else {
			res.send(settingsData);
		}
	})
}

function _handlePush(req, res) {
	log.info('GET ' + config.SETTINGS_API_URL + '/push');
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	});
	// var writeData = function(devicesData){
	// 	res.write("data: " + JSON.stringify(devicesData) + "\n\n");
	// };
	// devices.events.on('change', writeData);
	// req.on("close", function() {
	// 	devices.events.removeListener('change', writeData);
	// });
}


	