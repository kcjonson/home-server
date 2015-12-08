var log = require('./log');
var actions = require('./actions');
var conditions = require('../util/conditions');


exports.start = _start;




/*

	TODOS:
	- Move to database
	- Call actions by ID, not name


*/




var STARTED = false;
function _start() {
	if (STARTED !== true) {
		STARTED = true;
		TRIGGERS.forEach(function(triggerDoc){
			if (triggerDoc.events && triggerDoc.events.forEach) {
				// Set up trigger event listeners
				triggerDoc.events.forEach(function(event){
					if (event.library && conditions.libraries[event.library]) {
						var lib = conditions.libraries[event.library];
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

function _checkEventEquality(trigger, e, eventPayload) {
	//log.debug(trigger, e, eventPayload);
	// If the event has an equality (e.g. to: false) then check to see if its been 
	// satisfied, otherwise, just check the conditions and proceed. (its optional)
	if (e.equality) {
		if (conditions.equality(e.equality, eventPayload.value, e.value)) {
			conditions.check(trigger.conditions, function(satisfied){
				if (satisfied === true) {_runTriggerActions(trigger)}
			});
		}
	} else {
		conditions.check(trigger.conditions, function(satisfied){
			if (satisfied === true) {_runTriggerActions(trigger)}
		});
	}
};


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
				name: 'Turn On Outside Lights'
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
				library: 'devices',
				to: true
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

