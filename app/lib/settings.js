var SettingModel = require('../models/setting');
var log = require('../lib/log');
var database = require('./database');

exports.get = _get;
exports.set = _set;


// NOTE: This is a bit of an odd class at the momennt
// because we should only ever have one settings doc
// in the collection at any time. -KCJ

function _get(params, callback) {
	if (typeof params == 'function' && !callback) {
		callback = params;
		params = undefined;
	}
	// We shold only have one, so just get that.  Probally should
	// order by most recently modified or something. -KCJ
	database.findOne(SettingModel, null, function(e, settingDoc){
		if (e) {
			log.error(e)
			callback('Error getting settings');
		} else if (!settingDoc) {
			log.error('No settings documents found in database')
			callback('Error getting settings: Unable to load settings from database');
		} else {
			callback(null, settingDoc);
		}
	})
}

function _set(props, callback) {
	log.debug(props);
	database.findOne(SettingModel, null, function(err, settingDoc){
		if (settingsDoc) {
			settingDoc.set(props);
			settingDoc.save(function(err, updatedDocument){
				callback(err, updatedDocument)
			})
		} else if (!err && !settingDoc){
			callback('An unknown error occured while saving settings');
		} else {
			callback(err);
		}
	})
}