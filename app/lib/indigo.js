var indigo = require('indigo/lib/indigo');
var config = require('../../config/indigo.json');
var log = require('./log');
var EventEmitter = require("events").EventEmitter;

exports.getDevices = _getDevices;
exports.getDevicesByType = _getDevicesByType;
exports.getDevice = _getDevice;
exports.getDeviceByHardwareId = _getDeviceByHardwareId;
exports.setDeviceProperties = _setDeviceProperties;
exports.setDevicePropertiesByHardwareId = _setDevicePropertiesByHardwareId;
exports.getVariables = _getVariables;
exports.getVariable = _getVariable;
exports.setVariable = _setVariable;
exports.getActions = _getActions;
exports.getAction = _getAction;
exports.executeAction = _executeAction;
exports.push = _push;
exports.events = new EventEmitter();




// Since the Indigo API only allows for info to be requested by "name"
// but our API wants to request things by hardwareId we're going to maintain
// a map to reduce the number of lookups.
// 
// We're using "addressStr" as "hardwareId" because thats whats printed on
// the actual devices.
var HARDWARE_ID_TO_NAME_MAP = {};




// Server Connection


indigo.connectServer({
	host: 'localhost',
	port: config.INDIGO_PORT,
	serverPath: config.INDIGO_ROOT_URL
});

// Seed Map
_getDevices(function(){});





// Devices Helpers


function _getDevicesByType(types, callback) {
	var matchedDevices = [];
	_getDevices(function(err, devicesData){
		devicesData.forEach(function(deviceData){
			if (types && types.forEach) {
				types.forEach(function(type){
					if (deviceData.type && deviceData.type == type) {
						matchedDevices.push(deviceData);
					}
				});
			} else {
				callback('getDevicesByType types is malformed')
			}
		});
		callback(null, matchedDevices);
	});
};


function _getDevices(callback) {
	indigo.getDevices(
		function(devicesData){
			var index = 0;
			function getNextDevice() {
				var deviceData = devicesData[index];
				_getDevice(deviceData.name, function(error, newDeviceData){
					if (error) {callback(error)} else {
						devicesData[index] = newDeviceData;
						if (index + 1 == devicesData.length) {
							callback(null, devicesData);
						} else {
							index = index + 1;
							getNextDevice();
						}
					}
				});
			}
			getNextDevice();
		},
		function(error) {
			callback(error);
		}
	);
};

function _getDevice(deviceName, callback) {
	indigo.getDevice(
		deviceName,
		function(deviceData) {
			HARDWARE_ID_TO_NAME_MAP[deviceData.addressStr] = deviceData.name;
			callback(null, deviceData);
		},  
		function(error) {
			callback(error);
		}
	);
};

function _getDeviceByHardwareId(hardwareId, callback) {
	var deviceName = HARDWARE_ID_TO_NAME_MAP[hardwareId];
	_getDevice(deviceName, callback);
};

function _setDeviceProperties(name, properties, callback) {
	indigo.setDeviceProperties(
		name,
		properties,
		function(deviceData) {
			callback(null, deviceData);
		},
		function(error) {
			callback(error);
		}
	)
}

function _setDevicePropertiesByHardwareId(hardwareId, properties, callback) {
	var deviceName = HARDWARE_ID_TO_NAME_MAP[hardwareId];
	_setDeviceProperties(deviceName, properties, callback)
}






// Variables Helpers

function _getVariables(callback) {
	indigo.getVariables(
		function(variablesData){
			var index = 0;
			function getNextVariable() {
				var variableData = variablesData[index];
				_getVariable(variableData.name, function(error, newVariableData){
					if (error) {callback(error)} else {
						variablesData[index] = newVariableData;
						if (index + 1 == variablesData.length) {
							callback(null, variablesData);
						} else {
							index = index + 1;
							getNextVariable();
						}
					}
				});
			}
			getNextVariable();
		},
		function(error) {
			callback(error);
		}
	)
}

function _getVariable(variableName, callback) {
	indigo.getVariable(
		variableName,
		function(variableData) {
			variableData.xmlPath = undefined;
			variableData.isFalse = undefined;
			callback(null, variableData);
		},
		function(error) {
			callback(error);
		}
	);
};

function _setVariable(variableName, value, callback) {
	log.info('Setting Indigo variable ', variableName, value);
	indigo.setVariable(
		variableName,
		value, 
		function(){
			_getVariable(variableName, function(error, variableData){
				if (error) {callback(error)} else {
					callback(null, variableData)
				}
			});
		},
		function(error) {
			callback(error);
		}
	)
};



// Actions Helpers


function _getActions(callback) {
	indigo.getActions(
		function(actionsData){
			var index = 0;
			function getNextAction() {
				var actionData = actionsData[index];
				_getAction(actionData.name, function(error, newActionData){
					if (error) {callback(error)} else {
						actionsData[index] = newActionData;
						if (index + 1 == actionsData.length) {
							callback(null, actionsData);
						} else {
							index = index + 1;
							getNextAction();
						}
					}
				});
			}
			getNextAction();
		},
		function(error) {
			callback(error);
		}
	)
};

function _getAction(actionName, callback) {
	indigo.getAction(
		actionName, 
		function(actionData){
			actionData.xmlPath = undefined;
			callback(null, actionData);
		},
		function(error){
			callback(error)
		}
	);
};

function _executeAction(action, callback) {
	log.info('Run Indigo Action', action);
	indigo.executeAction(action, function(error){
		if(!error) {
			if (callback) {callback()}
		} else {
			if (callback) {callback(error)}
		}
	});
};


function _push(data) {
	log.debug(data);
	if (data.addressStr) {
		_getDeviceByHardwareId(data.addressStr, function(err, deviceData){
			log.debug(err, deviceData);
			if (!err) {
				exports.events.emit("change", [data]);
				var prunedData = JSON.parse(JSON.stringify(data));
				delete prunedData.hardwareId;
				exports.events.emit("change[" + data.addressStr + "]", data);
				// TODO: Emit specific prop changes
			}
		});
	}
}

