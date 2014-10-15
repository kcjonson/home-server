var indigo = require('indigo/lib/indigo');
var config = require('../../config/indigo.json');


exports.connectServer = _connectServer;
exports.getDevices = _getDevices;
exports.getDevice = _getDevice;
exports.setDeviceProperties = _setDeviceProperties;
exports.getVariables = _getVariables;
exports.getVariable = _getVariable;
exports.setVariable = _setVariable;
exports.getActions = _getActions;
exports.getAction = _getAction;
exports.executeAction = _executeAction;






// Server Connection

function _connectServer() {
	indigo.connectServer({
		host: 'localhost',
		port: config.INDIGO_PORT,
		serverPath: config.INDIGO_ROOT_URL
	});
};






// Devices Helpers


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
			callback(null, deviceData);
		},  
		function(error) {
			callback(error);
		}
	);
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
	console.log('Run Indigo Action', action);
	indigo.executeAction(action, function(error){
		if(!error) {
			if (callback) {callback()}
		} else {
			if (callback) {callback(error)}
		}
	});
};

