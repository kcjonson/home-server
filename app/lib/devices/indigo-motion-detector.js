var log = require('../../lib/log');
var indigo = require('../indigo');
var EventEmitter = require("events").EventEmitter;

exports.get = _get;
exports.set = _set;
exports.start = _start;
exports.events = new EventEmitter();





var MOTION_SENSOR_NAMES = [
	'Motion Sensor'
];

var LISTENERS = {};

// Startup
// Do nothing with the results, just attach event listeners
function _start() {
	_get(function(err, deviceData){})
};


function _get(id, callback) {
	if (typeof id === 'function') {
		callback = id;
		id = undefined;
	}
	if (id) {
		indigo.getDeviceByHardwareId(id, function(err, deviceData){
			if (err) {callback(err); return};
			callback(null, _formatData(deviceData));
		})
	} else {
		log.debug('Getting all Indigo Motion Detectors')
		indigo.getDevicesByType(MOTION_SENSOR_NAMES, function(err, devicesData){
			var normalizedDevicesData = [];
			if (devicesData && devicesData.forEach) {
				devicesData.forEach(function(deviceData){
					normalizedDevicesData.push(_formatData(deviceData));
					var eventName = "change:" + deviceData.hardwareId;
					if (LISTENERS[deviceData.hardwareId]) {
						indigo.events.removeListener(eventName, LISTENERS[deviceData.hardwareId])
					}
					LISTENERS[deviceData.hardwareId] = indigo.events.on(eventName, _onChange);
				});
				callback(null, normalizedDevicesData);
			} else {
				callback('An unexpected error occured')
			}
		})
	}
}

function _set(id, props, callback) {
	indigo.setDevicePropertiesByHardwareId(id, props, function(err, deviceData){
		if (deviceData) {
			deviceData = _formatData(deviceData);
		}
		callback(err, deviceData)
	});
};

function _formatData(deviceData) {
	return {
		name: deviceData.name,
		hardwareId: deviceData.addressStr,
		lastChanged: new Date(deviceData.lastChangedRFC3339)
	}
}

function _onChange(deviceData) {
	log.debug(deviceData);
	exports.events.emit("change", [_formatData(deviceData)]);
	exports.events.emit("change:" + deviceData.addressStr, _formatData(deviceData));
}

