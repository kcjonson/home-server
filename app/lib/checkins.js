var database = require('./database');
var checkinModel = require('../models/checkin');
var config = require('../../config/checkins.json');
var log = require('./log');
var EventEmitter = require("events").EventEmitter;
var ObjectId = require('mongodb').ObjectID;


exports.add = _add;
exports.getByUserId = _getByUserId;
exports.getRecent = _getRecent;
exports.events = new EventEmitter();



function _add(data, callback) {
	//log.debug(data);
	exports.events.emit("add", data);

	if (!data.name) {
		data.name = config.CHECKINS_UNKNOWN_NAME;
	};

	var newCheckin = new checkinModel(data);
	database.save(newCheckin, function(error){
		//log.debug('Save Successful');
		if (callback) {
			callback();
		}
	});
};

// Get all checkins
// This will have to be limited at some point ... 
function _getByUserId(userId, callback) {
	database.find(checkinModel, {user: userId}, null, {sort: {date: -1}, limit: 100}, callback)
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

