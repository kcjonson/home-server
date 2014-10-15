var config = require('../../config/geohopper.json');

var EVENTS_MAP = {};
var STARTED = false;

exports.start = function(params) {
	if (!STARTED) {

		// Check Params
		var app = params.app;
		var pushUrl = params.pushUrl;

		// 	Listen for Events
		app.post(config.GEOHOPPER_PUSH_URL, function(req, res){
			console.log('Geohopper Push Recieved');
			var data = req.body;
			if (data) {
				switch (data.event) {
					case 'LocationEnter':
						emit('enter', data);
						break;
					case 'LocationExit':
						emit('exit', data);
						break;
					default:
						emit('exit', data);
				};
			};
			res.end();
		});
		STARTED = true;
	};
};

// Temp
exports.GEOHOPPER_HOME = config.GEOHOPPER_HOME;

exports.on = function(event, callback) {
	if (EVENTS_MAP[event]) {
		EVENTS_MAP[event].callbacks.push(callback);
	} else {
		EVENTS_MAP[event] = {
			name: event,
			callbacks: [
				callback
			]
		};
	}
};

function emit(event, params) {
	if (EVENTS_MAP[event]) {
		EVENTS_MAP[event].callbacks.forEach(function(callback){
			callback(params);
		})
	}
}





