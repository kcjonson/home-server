var checkins = require('./checkins');
var users = require('./users');
var devices = require('./devices');
var weather = require('./weather');
var log = require('./log');
var actions = require('./actions');


exports.start = _start;







// Get the lib reference from the string.
var LOCATION_TO_LIBRARY_MAP = {
	'users': users,
	'devices': devices,
	'weather': weather
}

// What are the available relations for a given library type
var TYPE_TO_RELATIONS_MAP = {
	'COLLECTION': {
		'item in': 0
	},
	'SERVICE': {
		'property on': 0
	}
};





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
				value: 'true'
			}
		],
		actions: [
			'Turn On Downstairs Lights'
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
				value: 'true'
			}
		],
		conditions: [
			{
				which: 'isDaylight',
				relation: 'property on',
				library: 'weather',
				equality: 'is',
				value: 'false'
			}
		],
		actions: [
			'Turn On Outside Lights'
		]
	},
	{
		name: 'Motion Detected While Away',
		_id: 3,
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
				on: 'every',
				relation: 'item in',
				location: 'users',
				equality: 'is',
				value: 'false'
			}
		],
		actions: [
			'Turn On All Lights'
		]
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
					if (event.library && LOCATION_TO_LIBRARY_MAP[event.library]) {
						var lib = LOCATION_TO_LIBRARY_MAP[event.library];
						var eventString = event.name;
						eventString += event.on ? '[' + event.on + ']' : '';  // Append specific item if applicable
						eventString += event.property ? ':' + event.property: '';  // Append the specific property if applicable

						log.debug('Trigger Listening for event: ', event.library, eventString)

						// Listen for trigger event on library
						lib.events.on(eventString, function(eventPayload){
							log.debug('Trigger Event')
							var doTrigger = false;
							// Resolve event payload equality
							switch (event.equality) {
								case undefined:
								case null:
								case '':
									doTrigger = true;
									break;
								case 'is':
									doTrigger = eventPayload === event.value;
									break;
								case 'is not':
									doTrigger = eventPayload !== event.value;
									break;
								case 'is greater than':
									doTrigger = eventPayload > event.value;
									break;								
								case 'is less than':
									doTrigger = eventPayload < event.value;
									break;
								default: 
									doTrigger = false;
									log.error('Unrecognized equality on trigger event: ' + event.equality);
							}
							log.debug('Payload Equality Complete', doTrigger)
							if (!doTrigger) {return};


							// Check additional conditions
							if (triggerDoc.conditions && triggerDoc.conditions.forEach) {
								// TODO: check conditions
								doTrigger = false;
							}
							if (!doTrigger) {return};


							// Run trigger actions
							if (triggerDoc.actions && triggerDoc.actions.forEach) {
								triggerDoc.actions.forEach(function(actionId){
									actions.execute(actionId, function(err){
										if (err) {
											log.error('Unable to run trigger action', triggerDoc.name, actionId, err);
										}
									})
								})
							} else {
								log.error('Trigger actions not found', triggerDoc.name)
							}





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

