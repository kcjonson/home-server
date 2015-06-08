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


var GEOFENCE_RADIUS = 200; // Distance in meters. 


function _add(data, callback) {
	//log.debug(data);
	if (!data.name) {
		data.name = config.CHECKINS_UNKNOWN_NAME;
		if (data.coordinates) {
			settings.get(function(err, settingsData){
				var distance = geolib.getDistance(
					{latitude: data.coordinates[1], longitude: data.coordinates[0]},
					{latitude: settingsData.coordinates[1], longitude: settingsData.coordinates[0]}
				);
				if (distance < GEOFENCE_RADIUS) {
					data.name = 'Home';
				}
				_saveCheckinData(data, callback);
			});
		} else {
			_saveCheckinData(data, callback);
		}
	};
};

function _saveCheckinData(data, callback) {
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

