var log = require('../../lib/log');
var indigo = require('../indigo');
var _indigo = require('./_indigo');
var EventEmitter = require("events").EventEmitter;
var EventUtil = require('../../util/Event');


exports.get = _get;
exports.set = _set;
exports.start = _start;
exports.events = new EventEmitter();



var MOTION_SENSOR_NAMES = [
	'Motion Sensor'
];

var LISTENERS = {};



// Startup
// Listen to device specific change events from the indigo lib
// then bubble them out with proper data.
function _start() {
	_indigo.start.call(this, LISTENERS);
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
				});
				callback(null, normalizedDevicesData);
			} else {
				callback('An unexpected error occured')
			}
		});
	};
};

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
		lastChanged: new Date(deviceData.lastChangedRFC3339),
		isOn: deviceData.isOn
	}
}



