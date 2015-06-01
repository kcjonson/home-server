var checkins = require('./checkins');
var users = require('./users');
var devices = require('./devices');
var log = require('../lib/log');


exports.start = _start;


var EVENTS = {
	"checkins:change": {},
	"devices:change": {}
}


/*

	Equality:

		Change Monitoring
		- changes to
		- changes from
		- changes (no value)

		Static
		- is
		- is not
		- is greater than
		- is less than


	Relations:
		- property on
		- item in (no "on")

*/


var LOCATION_TO_LIB_MAP = {
	'users': '',

}



var TRIGGERS = [
	{
		name: 'Anyone Arrives Home',
		_id: 1,
		conditions: [
			{
				which: 'areHome',
				relation: 'property on',
				location: 'users',
				equality: 'changes to',
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
		conditions: [
			{
				which: 'isDaylight',
				relation: 'property on',
				location: 'weather',
				equality: 'is',
				value: 'false'
			},
			{
				which: 'areHome',
				relation: 'property on',
				location: 'users',
				equality: 'changes to',
				value: 'true'
			}
		],
		actions: [
			'Turn On Outside Lights'
		]
	},
	{
		name: 'Motion Detected While Away',
		_id: 3,
		conditions: [
			{
				which: 'lastTriggered',
				on: '554d3dce743ed3ca3e4742be',
				relation: 'item in',
				location: 'devices',
				equality: 'changes'
			},
			{
				which: 'areHome',
				relation: 'property on',
				location: 'users',
				equality: 'is',
				value: 'false'
			}
		],
		actions: [
			'Turn On Outside Lights'
		]
	}
]


var STARTED = false;
function _start() {
	if (STARTED !== true) {
		STARTED = true;


		TRIGGERS.forEach(function(triggerDoc){

			triggerDoc.conditions.forEach(function(condition){
				
			});

		});

		devices.events.on('change', function(data){
			log.debug('devices change', data)
		});

		users.events.on('change:isHome', function(data){
			log.debug('users change:isHome', data)
		});

	}
}