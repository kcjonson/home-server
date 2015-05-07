var config = require('../../../config/nest.json');
var request = require('request');
var Firebase = require('firebase');
var log = require('../../lib/log');


exports.authenticate = _authenticate;
exports.get = _get;
exports.set = _set;


var ACCESS_TOKEN = config.NEST_ACCESS_TOKEN;
var ACCESS_TOKEN_EXPIRES;
var REMOTE;


function _get(id, callback) {
	if (typeof id === 'function') {
		callback = id;
		id = undefined;
	}

	if (!REMOTE) {
		REMOTE = new Firebase('wss://developer-api.nest.com', new Firebase.Context());
		REMOTE.authWithCustomToken(ACCESS_TOKEN, function(err, authData){
			if (err) {
				callback(err);
			};
		});
	};

	if (id) {
		log.debug('Getting Nest Thermostat: ' + id);
		REMOTE.once('value', function(snapshot) {
			var thermostatData;
			var thermostatsObject = snapshot.val().devices.thermostats
			var thermostatsKeys = Object.keys(thermostatsObject);
			thermostatsKeys.forEach(function(key, index) {
				if (key == id) {
					thermostatData = _formatData(thermostatsObject[key])
				}
			});
			if (thermostatData) {
				callback(null, thermostatData);
			} else {
				callback('Unable to get thermostat data for' + id)
			}
		}, function(err){
			if (err) {callback(err); return;};
		});
	} else {
		log.debug('Getting all Nest Thermostats')
		REMOTE.once('value', function(snapshot) {
			var thermostatsArray = []
			var thermostatsObject = snapshot.val().devices.thermostats
			var thermostatsKeys = Object.keys(thermostatsObject);
			thermostatsKeys.forEach(function(key, index) {
				thermostatsArray.push(_formatData(thermostatsObject[key]));
			});
			callback(null, thermostatsArray);
		}, function(err){
			if (err) {callback(err); return;};
		});
	};
};

function _set(id, props, callback) {
	callback();
};


function _authenticate(code) {
	request.post(
		config.NEST_REMOTE_ACCESS_TOKEN_URL,
		{form: {
			code: code,
			client_id: config.NEST_CLIENT_ID,
			client_secret: config.NEST_CLIENT_SECRET,
			grant_type: 'authorization_code'
		}},
		function(err, httpResponse, body){
			body = JSON.parse(body);
			console.log('Nest Auth Success', body.access_token);
			ACCESS_TOKEN_EXPIRES = body.expires_in;  // Should be added to date.
			ACCESS_TOKEN = body.access_token;
		}
	);
};

function _formatData(deviceData) {
	return {
		name: deviceData.name,
		hardwareId: deviceData.device_id,
		temperatureAmbient: deviceData.ambient_temperature_f,
		temperatureAwayHigh: deviceData.away_temperature_high_f,
		temperatureAwayLow: deviceData.away_temperature_low_f,
		temperatureTarget: deviceData.target_temperature_f,
		temperatureTargetHigh: deviceData.target_temperature_high_f,
		temperatureTargetLow: deviceData.target_temperature_low_f
	}
}
