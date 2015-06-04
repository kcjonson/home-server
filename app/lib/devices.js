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


/* 

	This libary is the manager for linking to devices
	of assorted types.  It maintains a list of all the
	device types that the application knows about and 
	facilitates communication with them.




	TODO:
	- Add Devices:
		- koubuchi
		- lifx
		- onkyo-reciever
	- Change Monitoring
	- Disconnected/Unavailable Devices



*/



// PUBLIC API

exports.get = _get;
exports.set = _set;
exports.sync = _sync;
exports.start = _start;
exports.events = new EventEmitter();


// Devices that have keepAlive get checked
var CHECK_INTERVAL = 10 * 1000; // Every ten seconds


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
};

// Props that will trigger an error if 
// they are attempted to be set.
var PROTECTED_PROPS = [
	'id',
	'_id',
	'type'
];

// Props that should be saved to the DB 
// instead of sent to the device lib
var DB_PROPS = [
	'name',
	'category',
	'location'
];

var LISTENERS = {};







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


// Note: databaseId not hardwareId since hardwareId is not 
// unique across all device types.
function _set(databaseId, props, callback) {
	log.debug(databaseId, props);
	database.findOne(config.DEVICES_COLLECTION, {'_id': databaseId}, function(err, deviceDoc){
		if (deviceDoc && deviceDoc.type) {

			var libProps = {};
			var dbProps = {};

			for (var prop in props) {
				if (props.hasOwnProperty(prop)) {
					if (PROTECTED_PROPS.indexOf(prop) >= 0) {
						callback('Property ' + prop + ' is protected and cannot be set');
					} else if (DB_PROPS.indexOf(prop) >= 0) {
						dbProps[prop] = props[prop];
					} else {
						libProps[prop] = props[prop];
					}
				}
			}

			// Set Lib Props 
			if (Object.keys(libProps).length > 0) {
				var deviceLib = DEVICE_TYPES[deviceDoc.type].lib;
				deviceLib.set(deviceDoc.hardwareId, libProps, function(err, deviceData){
					if (!err) {
						exports.events.emit("change", [_formatData(deviceDoc, deviceData)]);
						exports.events.emit("change" + deviceDoc._id, _formatData(deviceDoc, deviceData));
					}
					callback(err, deviceData);
				});
			};

			// Set Device Props
			if (Object.keys(dbProps).length > 0) {
				// Since the findOne earlier was done on a collection at the
				// Mongo layer, it did not return a document. We need to fetch the real document
				// so we can modify it.  This is rather annoying. -KCJ
				database.findOne(DEVICE_TYPES[deviceDoc.type].model, {'_id': deviceDoc._id}, function(err, deviceDocument){
					deviceDocument.set(dbProps);
					deviceDocument.save(function(err, updatedDocument){
						callback(err, updatedDocument)
					})
				});
			}
		} else if (err) {
			callback(err)
		} else {
			callback('Unable to find device');
		}
	});
};

function _formatData(deviceDoc, deviceData) {
	// The individual devices will return null if the device
	// was unable to be communicated with.  This is normal for
	// some devices like Airplay Speakers that may be turned off.
	if (!deviceData) {
		deviceData = {
			offline: true
		}
	}
	deviceData.type = deviceDoc.type;
	deviceData.category = deviceDoc.category;
	deviceData.location = deviceDoc.location;
	deviceData._id = deviceDoc._id;
	delete deviceData.hardwareId;
	return deviceData;
};







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




var CHECK_INTERVAL_HANDLE;
function _keepAlive(deviceDocs){
	var startDelay = CHECK_INTERVAL - new Date() % CHECK_INTERVAL;
	setTimeout(function(){
		clearInterval(CHECK_INTERVAL_HANDLE);
		CHECK_INTERVAL_HANDLE = setInterval(function(){
			deviceDocs.forEach(function(deviceDoc){
				var deviceLib = DEVICE_TYPES[deviceDoc.type].lib;
				deviceLib.keepAlive(deviceDoc.hardwareId, function(err){
					if (err) {console.error(err)}
				});
			})
		}, CHECK_INTERVAL);
	}, startDelay);
};




var KEEP_ALIVE_LOADED = false;
function _start() {

	// Start Device Libs
	indigoMotionDetector.start();


	// Start Keep Alive and Listen to events
	if (KEEP_ALIVE_LOADED !== true) {
		KEEP_ALIVE_LOADED = true;
		setTimeout(function(){
			var devicesToKeepAlive = [];
			database.getCollection(config.DEVICES_COLLECTION, function(err, deviceDocs){
				var docsChecked = 0;
				deviceDocs.forEach(function(deviceDoc){

					// Attach Keepalive (hard coded for now)
					if (deviceDoc.type == 'AIRFOIL_SPEAKER') {
						devicesToKeepAlive.push(deviceDoc);
					}

					// Listen for change events
					var deviceLib = DEVICE_TYPES[deviceDoc.type].lib;
					if (deviceLib && deviceLib.events && deviceLib.events.on) {
						var eventName = "change:" + deviceDoc.hardwareId;
						if (LISTENERS[deviceDoc._id]) {
							deviceLib.events.removeListener(eventName, LISTENERS[deviceDoc._id])
						}
						LISTENERS[deviceDoc._id] = deviceLib.events.on(eventName, function(deviceData){
							exports.events.emit("change", [_formatData(deviceDoc, deviceData)]);
							exports.events.emit("change" + deviceDoc._id, _formatData(deviceDoc, deviceData));
						})
					}
					docsChecked += 1;
					if (docsChecked == deviceDocs.length) {
						_keepAlive(devicesToKeepAlive);
					}
				});
			});
		}, 1000);
	}

};

