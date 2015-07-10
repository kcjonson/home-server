var database = require('./database');
var checkinModel = require('../models/checkin');
var config = require('../../config/checkins.json');
var log = require('./log');
var settings = require('./settings');
var EventEmitter = require("events").EventEmitter;
var ObjectId = require('mongodb').ObjectID;
var geolib = require('geolib');


exports.add = _add;
exports.getByUserId = _getByUserId;
exports.getRecent = _getRecent;
exports.events = new EventEmitter();


function _add(data, callback) {
	log.debug(data);
	if (!data.name) {
		data.name = config.CHECKINS_UNKNOWN_NAME;
	}
	if (data.coordinates && data.coordinates.length === 2) {

		// Look for significant change
		var options = {
			limit: 1,
			sort: {
				date: -1
			}
		}
		database.find(checkinModel, {user: data.user}, null, options, function(e, lastCheckinData){
			log.debug('Last checkin data', lastCheckinData);

			var distanceSinceLast = geolib.getDistance(
				{latitude: data.coordinates[1], longitude: data.coordinates[0]},
				{latitude: lastCheckinData[0].coordinates[1], longitude: lastCheckinData[0].coordinates[0]}
			);
			log.debug('Distance since last ', distanceSinceLast, config.CHECKINS_SAVE_DELTA_RADIUS)
			var significantDistance = distanceSinceLast > config.CHECKINS_SAVE_DELTA_RADIUS;
			var significantChange = false;
			if (significantDistance || (lastCheckinData[0].action !== data.action)) {
				significantChange = true;
			}
			if (significantChange) {
				// Save
				settings.get(function(err, settingsData){
					log.debug('Settings data: ', settingsData);
					var distanceFromHome = geolib.getDistance(
						{latitude: data.coordinates[1], longitude: data.coordinates[0]},
						{latitude: settingsData.coordinates[1], longitude: settingsData.coordinates[0]}
					);
					if (distanceFromHome < config.CHECKINS_HOME_GEOFENCE_RADIUS) {
						data.name = 'Home';
					}
					_saveCheckinData(data, callback);
				});
			} else {
				log.debug('No significantChange');
			}
		});
	} else {
		_saveCheckinData(data, callback);
	}

};

function _saveCheckinData(data, callback) {
	log.debug(data);
	var newCheckin = new checkinModel(data);
	database.save(newCheckin, function(error){
		exports.events.emit("add", data);
		if (error) {log.error(error)};
		if (callback) {callback()};
	});
}


// Get all checkins
function _getByUserId(userId, callback) {
	database.find(checkinModel, {user: userId}, null, {sort: {date: -1}, limit: 20}, callback)
};

function _getRecent(callback) {
	database.distinct('checkins', 'user', function(e, userIds){
		if (e){callback(e);return;}
		var usersLocated = 0;
		var checkins = [];
		userIds.forEach(function(userId){
			userId = ObjectId(userId.toString());
			var options = {
				limit: 2,
				sort: {
					date: -1
				}
			}
			database.find(checkinModel, {user: userId}, null, options, function(e, result){
				if (e){callback(e);return;}
				usersLocated += 1;
				checkins.push({
					current: result[0],
					previous: result[1]
				});
				if (usersLocated == userIds.length) {
					callback(null, checkins);
				}
			})
		});
	});
}

