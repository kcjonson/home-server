var log = require('../lib/log');
var database = require('./database');
var merge = require('merge');
var portholeSpeaker = require('./devices/porthole-speaker');




exports.get = _get;








var DEVICE_TYPES = {
	PORTHOLE_SPEAKER: {
		type: 'PORTHOLE_SPEAKER',
		lib: portholeSpeaker
	}
}



var DEVICES = [
	{
		type: DEVICE_TYPES.PORTHOLE_SPEAKER.type,
		id: 0,
		name: 'Office',
		hardwareId: '0025D1492909'
	}
]


_sync(function(e){
	console.log('Sync Complete');

})


function _get(callback) {
	var devicesData = {};
	DEVICES.forEach(function(device, index){
		var deviceLib = DEVICE_TYPES[device.type].lib;
		deviceLib.get(device.hardwareId || device.id, function(err, deviceInfo){
			devicesData[device.id] = merge(device, deviceInfo)
			if (index + 1 == DEVICES.length) {
				callback(null, devicesData)
			}
		});
	});
}


function _sync(callback) {

	var newDevices = [];

	var deviceTypesKeys = Object.keys(DEVICE_TYPES);
	deviceTypesKeys.forEach(function(key, index) {
		var deviceLib = DEVICE_TYPES[key].lib;
		deviceLib.get(function(err, devicesData){
			if (devicesData && devicesData.foreach) {
				devicesData.forEach(function(deviceData){
					newDevices.push({
						type: key,
						name: deviceData.name,
						hardwareId: deviceData.hardwareId
					});
				});
			};
		});
		if (deviceTypesKeys.length == index + 1) {
			_saveDevices(newDevices, callback);
		};
	});
};

function _saveDevices(deviceData, callback) {
	console.log('_saveDevices')
	callback();
}
