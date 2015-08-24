var log = require('./log');

module.exports = {
	set: _set,
	get: _get
}

var defaults = _load('../../config.default.json');
var user = _load('../../config.json', true);

function _get(prop) {

	if (user && user[prop] !== undefined) {
		if (_isValidValue(user[prop])) {
			return user[prop];
		} else {
			log.error('Property ' + prop + ' in config.default.js is malformed');
		}
	} else if (defaults[prop] !== undefined) {
		if (_isValidValue(defaults[prop])) {
			return defaults[prop];
		} else {
			log.error('Property ' + prop + ' in config.default.js is missing or malformed, user configuration should be done by creating a config.json to set or override values in config.default.json');
		}
	} else {
		log.error('Unable to get property: ' + prop);
	}
}

function _set() {
	// TODO?  Whats the use case?
}

function _load(path, optional) {
	try {
		return require(path)
	} catch (e) {
		if (e.code && e.code === 'MODULE_NOT_FOUND') {
			if (optional === true) {
				log.warn('Optional config not found, using defaults');
			} else {
				log.error('Cannot find required config file: ' + path);
				process.exit();
			}
		} else if(e instanceof SyntaxError) {
			log.error('Config file contains a syntax error: ', e.message);
			process.exit();
		}

	}
}

function _isValidValue(value) {
	return ((typeof value === 'string' && value.length > 0) 
		|| typeof value === 'boolean' 
		|| typeof value === 'number'
		|| (value.forEach && value.length && value.length > 0));
};