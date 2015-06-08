var database = require('./database');
var userModel = require('../models/user');
var checkins = require('./checkins');
var log = require('./log');
var speech = require('./speech');
var EventEmitter = require("events").EventEmitter;
var EventUtil = require('../util/Event');




// Public API
exports.get = _get;
exports.getById = _getById;
exports.setMostRecentCheckin = _setMostRecentCheckin;
exports.type = 'COLLECTION';

// Events Setup
exports.events = new EventEmitter();
checkins.events.on('add', _onAddCheckin);


// Getters
function _get(callback) {
	database.getAll(userModel, function(err, userModels){
		if (err) {callback(err); return;}
		var populatedUserModels = [];
		userModels.forEach(function(userModel){
			userModel.populate('mostRecentCheckin', function(err, populatedUserModel){
				if (err) {callback(err); return;}
				populatedUserModels.push(populatedUserModel);
				if (populatedUserModels.length == userModels.length) {
					callback(null, populatedUserModels)
				}
			});
		});
	});
};



exports.getByUsername = function(username, callback) {
	database.findOne(userModel, {'username': username}, callback);
}

exports.getByGeohopperName = function(geohopperName, callback) {
	database.findOne(userModel, {'accounts.geohopper': geohopperName}, callback);
}

exports.getByFoursquareId = function(foursquareName, callback) {
	database.findOne(userModel, {'accounts.foursquare': foursquareName}, callback);
}

// TODO: Not used yet.
exports.authenticate = function(username, password, callback) {
	_authenticate(username, password, callback);
};






// Utility Functions
function _getById(id, callback) {
	database.findOne(userModel, {'_id': id}, callback);
};

function _authenticate(username, password){};


// This should all be moved into a generic setter.
function _setMostRecentCheckin(userId, checkin, callback){
	log.debug('Setting most recent checkin', checkin);
	_getById(userId, function(error, userModel){
		if (error) {return;}

		if (checkin.name == 'Home' && checkin.action == 'ENTER') {
			// TODO Make sure we're not already home before announcing!
			//speech.say(userModel.name.first + ' is arriving home')
			userModel.isHome = true;
		} else {
			userModel.isHome = false;
		}

		// Update User Model
		userModel.mostRecentCheckin = checkin._id;
		database.save(userModel, function(error, savedUserModel){
			savedUserModel.populate('mostRecentCheckin', function(err, populatedUserModel){
				if (err) {callback(err); return;}
				EventUtil.emit(exports.events, {
					name: 'change',
					id: userId,
					property: 'isHome',
					data: populatedUserModel
				})
			});
		});


	});
};


// Event Handlers
function _onAddCheckin(data) {

	checkins.getRecent(function(e, checkinsData){
		var isHome = false;
		var wasHome = false;
		checkinsData.forEach(function(checkinData){
			if (checkinData.current.name == 'Home') {
				isHome = true;
			};
			if (checkinData.previous.name == 'Home') {
				wasHome = true;
			};
		});
		if (isHome && !wasHome) {
			exports.events.emit("change:areHome", true);
		}
		if (!isHome && wasHome) {
			exports.events.emit("change:areHome", false);
		}
	})
}



