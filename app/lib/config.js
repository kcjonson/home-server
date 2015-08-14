var log = require('./log');

module.exports = {
	set: _set,
	get: _get
}

var defaults = _load('../../config.default.json');
var user = _load('../../config.json');

function _get(prop) {
	if (user[prop] !== undefined) {
		if (_isValidValue(user[prop])) {
			return user[prop];
		} else {
			log.error('Property ' + prop + ' in config.default.js is malformed');
		}
	} else if (defaults[prop] !== undefined) {
		if (_isValidValue(defaults[prop])) {
			return defaults[prop];
		} else {
			log.error('Property ' + prop + ' in config.default.js is malformed, user configuration should be done by creating a config.json to set or override values in config.default.json');
		}
	} else {
		log.error('Unable to get property: ' + prop);
	}
}

function _set() {
	// TODO?  Whats the use case?
}

function _load(path) {
	try {
		return require(path)
	} catch (e) {
		log.error('Unable to load config file: ' + path);
		process.exit();
	}
}

function _isValidValue(value) {
	return ((typeof value === 'string' && value.length > 0) 
		|| typeof value === 'boolean' 
		|| typeof value === 'number'
		|| (value.forEach && value.length && value.length > 0));
};