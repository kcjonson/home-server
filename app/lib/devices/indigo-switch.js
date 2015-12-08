var log = require('../../lib/log');
var indigo = require('../indigo');

exports.get = _get;
exports.set = _set;
exports.start = _start;

var SWITCH_NAMES = [
	'SwitchLinc Relay'
];

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
		indigo.getDevicesByType(SWITCH_NAMES, function(err, devicesData){
			var normalizedDevicesData = [];
			if (devicesData && devicesData.forEach) {
				devicesData.forEach(function(deviceData){
					normalizedDevicesData.push(_formatData(deviceData));
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
		brightness: deviceData.brightness
	}
}
