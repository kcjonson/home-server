var checkins = require('./checkins');
var users = require('./users');
var devices = require('./devices');
var weather = require('./weather');
var log = require('./log');
var actions = require('./actions');


exports.start = _start;







// Get the lib reference from the string.
var LIBRARY_MAP = {
	'users': users,
	'devices': devices,
	'weather': weather
}





var TRIGGERS = [
	{
		name: 'Anyone Arrives Home',
		_id: 1,
		events: [
			{
				name: 'change',
				property: 'isHome',
				library: 'users',
				equality: 'to',
				value: true
			}
		],
		actions: [
			{
				type: 'DEVICE',
				deviceId: '554d3dce743ed3ca3e4742bd',
				property: 'brightness',
				value: 100
			},
			{
				type: 'DEVICE',
				deviceId: '554d3dce743ed3ca3e4742b0',
				property: 'brightness',
				value: 100
			},
			{
				type: 'DEVICE',
				deviceId: '554d3dce743ed3ca3e4742b3',
				property: 'brightness',
				value: 100
			}
		]
	},
	{
		name: 'Anyone Arrives Home After Dark',
		_id: 2,
		events: [
			{
				name: 'change',
				property: 'isHome',
				library: 'users',
				equality: 'to',
				value: true
			}
		],
		conditions: [
			{
				which: 'isDaylight',
				library: 'weather',
				equality: 'is',
				value: false
			}
		],
		actions: [
			{
				type: 'ACTION',
				name: 'Turn On All Lights'
			}
		]
	},
	{
		name: 'Everyone Leaves',
		_id: 3,
		events: [
			{
				name: 'change',
				property: 'isHome',
				library: 'users',
				equality: 'to',
				value: false
			}
		],
		conditions: [
			{
				property: 'isHome',
				relation: 'every',
				library: 'users',
				equality: 'is',
				value: false
			}
		],
		actions: [
			{
				type: 'ACTION',
				name: 'Turn Off All Lights'
			}
		]
	},
	{
		name: 'Motion Detected While Away',
		_id: 4,
		events: [
			{
				name: 'change',
				property: 'isOn',
				on: '554d3dce743ed3ca3e4742be',
				library: 'devices'
			}
		],
		conditions: [
			{
				property: 'isHome',
				relation: 'every',
				library: 'users',
				equality: 'is',
				value: false
			}
		],
		actions: []
	}
]


var STARTED = false;
function _start() {
	if (STARTED !== true) {
		STARTED = true;
		TRIGGERS.forEach(function(triggerDoc){
			if (triggerDoc.events && triggerDoc.events.forEach) {
				// Set up trigger event listeners
				triggerDoc.events.forEach(function(event){
					if (event.library && LIBRARY_MAP[event.library]) {
						var lib = LIBRARY_MAP[event.library];
						var eventString = event.name;
						eventString += event.on ? '[' + event.on + ']' : '';  // Append specific item if applicable
						eventString += event.property ? ':' + event.property: '';  // Append the specific property if applicable
						lib.events.on(eventString, function(eventPayload){
							_checkEventEquality(triggerDoc, event, eventPayload)
						});
					} else {
						log.error('Invalid library on trigger event: ', triggerDoc.name, event.library)
					}
				});
			} else {
				log.error('Triggers must have events', triggerDoc.name);
			}
		});
	}
}


function _checkEventEquality(trigger, event, eventPayload) {
	log.debug(event.equality);
	if (_checkEquality(event.equality, eventPayload, event.value)) {
		_checkConditions(trigger, event, eventPayload);
	}
};

function _checkConditions(trigger, event, eventPayload) {
	log.debug('')
	if (trigger.conditions && trigger.conditions.forEach) {
		var numTriggersChecked = 0;
		trigger.conditions.forEach(function(condition){
			if (condition.library && LIBRARY_MAP[condition.library]) {
				var lib = LIBRARY_MAP[condition.library];
				switch(lib.type) {
					case 'COLLECTION':
						_checkConditionOnCollection(condition, trigger, numTriggersChecked);
						break;
					case 'SERVICE':
						_checkConditionOnService(condition, trigger, numTriggersChecked);
						break;
					default:
						log.error('Unrecognized type on library: ', lib.type, condition.library);
				}
			} else {
				log.error('Invalid library on trigger condition: ', trigger.name, condition.library);
			}
		});
	} else {
		// No conditions to fulfill, jump directly to run
		_runTriggerActions(trigger);
	}
};


function _checkConditionOnCollection(condition, trigger) {
	log.debug('')
	var lib = LIBRARY_MAP[condition.library];
	lib.get(function(err, libData){
		var conditionsSatisfied = true;
		switch(condition.relation) {
			case 'every':
				var everyConditionSatified = true;
				libData.forEach(function(dataItem){
					if (dataItem[condition.property] !== undefined) {
						if (!_checkEquality(condition.equality, dataItem[condition.property], condition.value)) {  
							everyConditionSatified = false;
						}
					} else {
						log.error('Property does not exist on lib required by trigger condition', condition.property, lib.type)
					}
				});
				if (!everyConditionSatified) {
					conditionsSatisfied = false;
				}
				break;
			case 'any':

				// TODO
				
				break;
			default:
				log.error('Unrecognized relation on trigger condition', lib.relation);

				break;
		};
		if (conditionsSatisfied) {
			_runTriggerActions(trigger);
		};
	});
};

function _checkConditionOnService(condition, trigger) {
	log.debug('')
	var lib = LIBRARY_MAP[condition.library];
	lib.get(function(err, libData){
		var conditionsSatisfied = false;


		// switch(condition.relation) {

		// };
		//console.log('conditionsSatisfied', conditionsSatisfied);
		if (conditionsSatisfied) {
			_runTriggerActions(trigger);
		};
	});
};


function _checkEquality(equalityString, first, second) {
	switch (equalityString) {
		case undefined:
		case null:
		case '':
			return true;
			break;
		case 'is':
			return first === second;
			break;
		case 'is not':
			return first !== second;
			break;
		case 'is greater than':
			return first > second;
			break;								
		case 'is less than':
			return first < second;
			break;
		default: 
			return false;
			log.error('Unrecognized equality on trigger event: ' + event.equality);
	}
}


function _runTriggerActions(trigger) {
	log.info('Trigger: ', trigger.name);
	// Run trigger actions
	if (trigger.actions && trigger.actions.forEach) {
		trigger.actions.forEach(function(actionId){
			actions.execute(actionId, function(err){
				if (err) {
					log.error('Unable to run trigger action', trigger.name, actionId, err);
				}
			})
		})
	} else {
		log.error('Trigger actions not found', trigger.name)
	}
}

