var config = require('../../config/settings.json');
var log = require('../lib/log');
var database = require('./database');

exports.get = _get;
exports.set = _set;







function _get(params, callback) {
	if (typeof params == 'function' && !callback) {
		callback = params;
		params = undefined;
	}
	database.findOne(config.SETTINGS_COLLECTION, null, callback)
}

function _set(props, callback) {
	log.debug(props);
	database.findOne(config.SETTINGS_COLLECTION, null, function(err, deviceDoc){
		if (deviceDoc) {
			console.log(deviceDoc)
			callback()
		} else {
			callback(err);
		}
	})
}