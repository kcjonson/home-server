var users = require('../lib/users');
var devices = require('../lib/devices');
var weather = require('../lib/weather');
var log = require('../lib/log');


/*

Util for comparing conditions, useful for libs like actions and triggers.

There are two main types of libs that can be checked:
COLLECTION: Is a list of things such as devices, which may or may not summarize state
SERVICE: Is a single library that the data will be accessed directory

The lib is required for exporting its type so that we can check for it.  This is a bit
fragile and janky, but it will work for now. 

*/

var LIBRARY_MAP = {
	'users': users,
	'devices': devices,
	'weather': weather
}


// Public API
exports.check = _check;
exports.equality = _checkEquality
exports.libraries = LIBRARY_MAP;



function _check(conditions, callback) {
	log.debug(conditions)
	if (conditions && conditions.forEach) {
		var numConditionsChecked = 0;
		var numConditionsFulfilled = 0;
		conditions.forEach(function(condition){
			if (condition.library && LIBRARY_MAP[condition.library]) {
				var lib = LIBRARY_MAP[condition.library];
				switch(lib.type) {
					case 'COLLECTION':
						_checkOnCollection(condition, conditions, _checkDone.bind(this, conditions, numConditionsChecked, numConditionsFulfilled, callback));
						break;
					case 'SERVICE':
						_checkOnService(condition, conditions, _checkDone.bind(this, conditions, numConditionsChecked, numConditionsFulfilled, callback));
						break;
					default:
						log.error('Unrecognized type on library: ', lib.type, condition.library);
				}
			} else {
				log.error('Invalid library on condition: ', condition.library);
			}
		});
	} else {
		// No conditions to fulfill, immediately run callback
		callback(true);
	}
};

function _checkDone(conditions, numConditionsChecked, numConditionsFulfilled, callback, success) {
	numConditionsChecked += 1;
	if (success === true) {
		numConditionsFulfilled += 1;
	}
	//log.debug(numConditionsChecked, numConditionsFulfilled, success);
	if (numConditionsChecked === conditions.length) {
		if (numConditionsFulfilled === conditions.length) {
			callback(true);
		} else {
			callback(false)
		}
	}
}


function _checkOnCollection(condition, conditions, callback) {
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
						log.error('Property does not exist on lib required by condition:', condition.property, lib.type)
					}
				});
				if (!everyConditionSatified) {
					conditionsSatisfied = false;
				}
				break;
			case 'any':
				conditionsSatisfied = false;
				var propertyFound = false;
				libData.forEach(function(dataItem){
					if (dataItem[condition.property] !== undefined) {
						propertyFound = true;
						if (_checkEquality(condition.equality, dataItem[condition.property], condition.value)) { 
							conditionsSatisfied = true;
						}
					}
				});
				if (!propertyFound) {
					log.error('Property does not exist on lib required by condition:', condition.property, libData)
				}
				break;
			default:
				conditionsSatisfied = false;
				log.error('Unrecognized relation on  condition', lib.relation);
				break;
		};
		if (conditionsSatisfied) {
			callback(true);
		} else {
			callback(false)
		}
	});
};

function _checkOnService(condition, conditions, callback) {
	log.debug('')
	var lib = LIBRARY_MAP[condition.library];
	lib.get(function(err, libData){
		var conditionsSatisfied = false;

		log.error('_checkConditionOnService not implemented yet, hard coding to false')
		log.debug(condition, conditions, libData)

		// TODO: This might be useful some day.

		// switch(condition.relation) {

		// };
		//console.log('conditionsSatisfied', conditionsSatisfied);
		if (conditionsSatisfied) {
			callback(true);
		};
	});
};


function _checkEquality(equalityString, first, second) {
	//log.debug(equalityString, first, second);
	if (!(typeof first === 'boolean' || typeof first === 'string' || typeof first === 'number')) {log.error('\'first\' is in invalid format: ' + typeof first); return false;}
	if (!(typeof second === 'boolean' || typeof second === 'string' || typeof second === 'number')) {log.error('\'second\' is in invalid format:' + typeof second); return false;}
	switch (equalityString) {
		case undefined:
		case null:
		case '':
			return true;
			break;
		case 'is':
		case 'to':
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
			log.error('Unrecognized equality: ' + equalityString);
	}
}