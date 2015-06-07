var log = require('../../lib/log');
var indigo = require('../indigo');
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
					var eventName = "change[" + deviceData.addressStr + "]";
					if (LISTENERS[deviceData.addressStr]) {
						indigo.events.removeListener(eventName, LISTENERS[deviceData.addressStr])
					}
					LISTENERS[deviceData.addressStr] = indigo.events.on(eventName, function(indigoEventData){
						var prunedData = JSON.parse(JSON.stringify(indigoEventData));
						delete prunedData.addressStr;
						_onChange(deviceData.addressStr, prunedData);
					});
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
		lastChanged: new Date(deviceData.lastChangedRFC3339),
		isOn: deviceData.isOn
	}
}

function _onChange(addressStr, changeData) {
	EventUtil.emit(exports.events, {
		name: 'change',
		id: addressStr,
		data: changeData
	})
};


