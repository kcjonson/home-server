var log = require('../lib/log');
var database = require('./database');
var config = require('../../config/devices.json');
var EventEmitter = require("events").EventEmitter;


var AirfoilSpeakerModel = require('../models/devices/airfoil-speaker');
var airfoilSpeaker = require('./devices/airfoil-speaker');

var NestThermostatModel = require('../models/devices/nest-thermostat');
var nestThermostat = require('./devices/nest-thermostat');

var IndigoDimmerModel = require('../models/devices/indigo-dimmer');
var indigoDimmer = require('./devices/indigo-dimmer');

var IndigoMotionDetectorModel = require('../models/devices/indigo-motion-detector');
var indigoMotionDetector = require('./devices/indigo-motion-detector');

var IndigoSwitchModel = require('../models/devices/indigo-switch');
var indigoSwitch = require('./devices/indigo-switch');

var ITunesModel = require('../models/devices/itunes');
var itunes= require('./devices/itunes');


exports.get = _get;
exports.set = _set;
exports.sync = _sync;
exports.events = new EventEmitter();



/* 

	This libary is the manager for linking to devices
	of assorted types.  It maintains a list of all the
	device types that the application knows about and 
	facilitates communication with them.

*/




var DEVICE_TYPES = {
	AIRFOIL_SPEAKER: {
		type: 'AIRFOIL_SPEAKER',
		lib: airfoilSpeaker,
		model: AirfoilSpeakerModel
	},
	NEST_THERMOSTAT: {
		type: 'NEST_THERMOSTAT',
		lib: nestThermostat,
		model: NestThermostatModel
	},
	INDIGO_DIMMER: {
		type: 'INDIGO_DIMMER',
		lib: indigoDimmer,
		model: IndigoDimmerModel
	},
	INDIGO_MOTION_DETECTOR: {
		type: 'INDIGO_MOTION_DETECTOR',
		lib: indigoMotionDetector,
		model: IndigoMotionDetectorModel,
	},
	INDIGO_SWITCH: {
		type: 'INDIGO_SWITCH',
		lib: indigoSwitch,
		model: IndigoSwitchModel,
	},
	ITUNES: {
		type: 'ITUNES',
		lib: itunes,
		model: ITunesModel
	}
}

var CHANGE_LISTENERS = [];


/* 

TODO:

	- Add Devices:
		- itunes
		- koubuchi
		- lifx
		- onkyo-reciever
	- Change Monitoring
	- Disconnected/Unavailable Devices
	- Locations
	- Groups


*/




function _get(callback) {

	// TODO: Single Device

	var devicesData = [];
	var devicesLoaded = 0;
	database.getCollection(config.DEVICES_COLLECTION, function(err, deviceDocs){
		if (err) {callback(err); return;}
		deviceDocs.forEach(function(deviceDoc){

			// Fully Hydrate the Data Object since we don't store
			// state in the DB.  Do modify the objects slightly so that
			// the front end only deals with the mongo document ID.
			_getDevice(deviceDoc, function(err, deviceData){
				if (err) {callback(err); return;}
				devicesData.push(_formatData(deviceDoc, deviceData));
				devicesLoaded += 1;
				if (devicesLoaded === deviceDocs.length) {
					callback(null, devicesData);
				}
			})
		});
	});
};

function _getDevice(data, callback) {
	// Takes either an mongoId or a mongo document;
	if (typeof data === 'string') {
		// TODO
		// Look up document in DB to get hardware ID from mongoId
		// then run again with hardware ID
	} else if (typeof data === 'object') {
		var deviceLib = DEVICE_TYPES[data.type].lib;
		deviceLib.get(data.hardwareId, callback);
	}
};


// Note: databaseId not hardwareId since hardwareId are not 
// unique across all device types.
function _set(databaseId, props, callback) {
	log.debug(databaseId, props);
	database.findOne(config.DEVICES_COLLECTION, {'_id': databaseId}, function(err, deviceDoc){
		var deviceLib = DEVICE_TYPES[deviceDoc.type].lib;
		deviceLib.set(deviceDoc.hardwareId, props, function(err, deviceData){
			if (!err) {
				exports.events.emit("change", _formatData(deviceDoc, deviceData));
			}
			callback(err, deviceData);
		});
	});
};


function _formatData(deviceDoc, deviceData) {
	deviceData.type = deviceDoc.type;
	deviceData._id = deviceDoc._id;
	delete deviceData.hardwareId;
	return deviceData;
}





// Read all known device types from libraries and 
// save the resulting list to the database.
function _sync(callback) {
	log.debug('starting');
	var newDevices = [];
	var deviceTypesKeys = Object.keys(DEVICE_TYPES);
	var deviceTypesFetched = 0;
	deviceTypesKeys.forEach(function(key, index) {
		var deviceLib = DEVICE_TYPES[key].lib;
		deviceLib.get(function(err, devicesData){
			deviceTypesFetched += 1;
			log.debug('got devices', key, devicesData.length, deviceTypesKeys.length, deviceTypesFetched)
			if (err) {callback(err); return;}
			if (devicesData && devicesData.forEach) {
				devicesData.forEach(function(deviceData){
					newDevices.push({
						type: key,
						name: deviceData.name,
						hardwareId: deviceData.hardwareId
					});
				});
			};
			if (deviceTypesKeys.length == deviceTypesFetched) {
				_saveDevices(newDevices, callback);
			};
		});
	});
};

function _saveDevices(devicesData, callback) {
	log.debug('saving');
	database.dropCollection(config.DEVICES_COLLECTION, function(err){
		var totalDevices = devicesData.length;
		var devicesSaved = 0;
		devicesData.forEach(function(deviceData, index){
			var DeviceModel = DEVICE_TYPES[deviceData.type].model;
			log.debug(deviceData.type)
			delete deviceData.type;  // Schema has default
			var hydratedDeviceModel = new DeviceModel(deviceData);
			database.save(hydratedDeviceModel, function(err, doc){
				if (err) {callback(err);} else {
					devicesSaved += 1;
					if (devicesSaved == totalDevices) {
						callback(null, devicesSaved);
					}
				}
			})
		});
	})
};


// var didSync = false;
// function sync() {
// 	if (!didSync) {
// 		didSync = true;
// 		_sync(function(err){
// 			console.log('sync complete')
// 			if (err) {
// 				log.error(err);
// 			}
// 		})
// 	}
// }
// sync();
