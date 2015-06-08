var config = require('../../config/settings.json');
var SettingModel = require('../models/setting');
var log = require('../lib/log');
var database = require('./database');

exports.get = _get;
exports.set = _set;


function _get(params, callback) {
	if (typeof params == 'function' && !callback) {
		callback = params;
		params = undefined;
	}
	database.findOne(SettingModel, null, callback)
}

function _set(props, callback) {
	log.debug(props);
	database.findOne(SettingModel, null, function(err, deviceDoc){
		if (deviceDoc) {
			deviceDoc.set(props);
			deviceDoc.save(function(err, updatedDocument){
				callback(err, updatedDocument)
			})
		} else {
			callback(err);
		}
	})
}