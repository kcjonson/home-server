var Devices = require('../lib/devices');
var log = require('../lib/log');
var conditions = require('../util/conditions')





exports.get = _get;
exports.set = _set;
exports.execute = _lookupAndExecute;
exports.executeCommand = _executeCommand;





/*


	TODOS:
	- Currently these are only for devices, should change format to allow for other libs 
	- Move data to DB once format is settled


*/




function _get(callback) {
	var returnedActions = [];
	ACTIONS_DATA.forEach(function(ACTION){
		conditions.check(ACTION.conditions, function(isEnabled){
			returnedActions.push({
				name: ACTION.name,
				_id: ACTION._id,
				isEnabled: isEnabled,
				commands: ACTION.commands,
				conditions: ACTION.conditions
			});
			if (returnedActions.length === ACTIONS_DATA.length) {
				callback(null, returnedActions);
			}
		});
	});
	
};

function _set(id, properties, callback) {
	callback(null, properties);
};


function _lookupAndExecute(id, callback) {
	var actionFound = false;
	ACTIONS_DATA.forEach(function(ACTION){
		if (ACTION._id == id) {
			actionFound = true;
			_execute(ACTION, callback);
		}
	});
	if (!actionFound) {
		callback('Action ' + id + ' does not exist')
	};
};


function _execute(action, callback) {
	log.info('Executing action: ', action.name);
	// Get all the devices up front to save mutliple queries.
	Devices.get(function(err, devicesData){
		// We're going to take a final product of all 
		// the actions not actually run them in step.
		var deviceStates = {};
		action.commands.forEach(function(command){
			_addDeviceStateFromCommand(deviceStates, command, devicesData);
		});
		_updateDeviceStates(deviceStates, devicesData, callback)
	});
};

function _executeCommand(command) {
	var deviceStates = {}
	Devices.get(function(err, devicesData){
		_addDeviceStateFromCommand(deviceStates, command, devicesData);
		_updateDeviceStates(deviceStates, devicesData, callback)
	});
};

function _updateDeviceStates(deviceStates, deviceData, callback) {
	var devicesToUpdate = 0;
	var devicesUpdated = 0;
	for (var deviceId in deviceStates) {
		if (deviceStates.hasOwnProperty(deviceId)) {
			devicesToUpdate += 1;
			var props = {};
			props[deviceStates[deviceId].property] = deviceStates[deviceId].value;
			Devices.set(deviceId, props, function(err, deviceData){
				if (err) {callback(err)};
				devicesUpdated += 1;
				if (devicesUpdated == devicesToUpdate) {
					callback();
				}
			});
		}
	}
};

function _addDeviceStateFromCommand(deviceStates, command, devicesData) {
	if (!devicesData || devicesData.length < 1) {
		log.error('devicesData is not properly formed');
		callback('Unable to execute action');
	}
	switch (command.type) {
		case 'DEVICE':
			// Set properties of a single device
			deviceStates[command.deviceId] = {
				property: command.property,
				value: command.value
			};
			break;
		case 'TYPE':
			// Set properties for all devices of a single type
			devicesData.forEach(function(deviceData){
				if (deviceData.type == command.name) {
					deviceStates[deviceData._id] = {
						property: command.property,
						value: command.value
					};
				}
			});
			break;
		case 'ACTION':
			// Run an action
			ACTIONS_DATA.forEach(function(ACTION){
				if (ACTION.name == command.name) {
					ACTION.commands.forEach(function(subCommand){
						_addDeviceStateFromCommand(deviceStates, subCommand, devicesData);
					})
				}
			});
			break;
		default:
			log.error(commands.type + ' is not known action command type');
			callback('Unable to execute action');
	}
}




// TODO: PUT THESE IN THEIR PLACE (the database)

var ACTIONS_DATA = [
	{
		name: 'Set Movie Mood',
		_id: 1,
		commands: [
			{
				type: 'DEVICE',
				deviceId: '554d3dce743ed3ca3e4742b0',
				property: 'brightness',
				value: 40
			},
			{
				type: 'DEVICE',
				deviceId: '554d3dce743ed3ca3e4742bd',
				property: 'brightness',
				value: 40
			}
		]
	},
	{
		name: 'Turn Off All Lights',
		_id: 2,
		commands: [
			{
				type: 'TYPE',
				name: 'INDIGO_DIMMER',
				property: 'brightness',
				value: 0
			}
		],
		conditions: [
			{
				property: 'brightness',
				relation: 'any',
				library: 'devices',
				equality: 'is greater than',
				value: 0
			}
		]
	},
	{
		name: 'Turn On All Lights',
		_id: 3,
		commands: [
			{
				type: 'TYPE',
				name: 'INDIGO_DIMMER',
				property: 'brightness',
				value: 100
			}
		],
		conditions: [
			{
				property: 'brightness',
				relation: 'any',
				library: 'devices',
				equality: 'is less than',
				value: 100
			}
		]
	},
	{
		name: 'Set Bedtime Mood',
		_id: 4,
		commands: [
			{
				type: 'ACTION',
				name: 'Turn Off All Lights'
			},
			{
				type: 'DEVICE',
				deviceId: '554d3dce743ed3ca3e4742b5',
				property: 'brightness',
				value: 20
			},
			{
				type: 'DEVICE',
				deviceId: '554d3dce743ed3ca3e4742b6',
				property: 'brightness',
				value: 20
			},
			{
				type: 'DEVICE',
				deviceId: '554d3dce743ed3ca3e4742b8',
				property: 'brightness',
				value: 20
			}
		]
	},
	{
		name: 'Turn On Outside Lights',
		_id: 5,
		commands: [
			{
				type: 'DEVICE',
				deviceId: '554d3dce743ed3ca3e4742ba',
				property: 'brightness',
				value: 100
			},
			{
				type: 'DEVICE',
				deviceId: '554d3dce743ed3ca3e4742bb',
				property: 'brightness',
				value: 100
			}
		]
	},
	{
		name: 'Pause Music',
		_id: 6,
		commands: [
			{
				type: 'DEVICE',
				deviceId: '554d3dce743ed3ca3e4742ae',
				property: 'state',
				value: 'paused'
			},
		]
	},
	{
		name: 'Play KEXP',
		_id: 7,
		commands: [
			{
				type: 'DEVICE',
				deviceId: '554d3dce743ed3ca3e4742ae',
				property: 'playlist',
				value: 'Kexp'
			},
		]
	}
]

//currentTrackPlaylist



	