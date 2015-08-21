var SettingModel = require('../models/setting');
var log = require('../lib/log');
var database = require('./database');
var config = require('./config');

exports.get = _get;
exports.set = _set;


var CONFIG_VALUES = {
	'WEATHER_API_ENABLED': 'weatherEnabled',
	'ALARMS_API_ENABLED': 'alarmsEnabled',
	'DEVICES_API_ENABLED': 'devicesEnabled',
	'ACTIONS_API_ENABLED': 'actionsEnabled'
}


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

			// We also want to pass back some "config" to the client, but
			// for convience we don't want to make two end points, so we're 
			// going to append it here.
			var payload = JSON.parse(JSON.stringify(settingDoc));
			Object.keys(CONFIG_VALUES).forEach(function(key){
				payload[CONFIG_VALUES[key]] = config.get(key);
			})


			callback(null, payload);
		}
	})
}

function _set(props, callback) {
	log.debug(props);

	if (props._id) {
		// TODO: Actually use _id 
		database.findOne(SettingModel, null, function(err, settingDoc){
			if (settingDoc) {
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
	} else {
		// Save initial settings
		var setting = new SettingModel(props);
		database.save(setting, function(error, savedSetting){
			if (error) {log.error(error)}
			callback(error, savedSetting);
		});
	}
}