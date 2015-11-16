var database = require('./database');
var UserModel = require('../models/user');
var checkins = require('./checkins');
var log = require('./log');
var speech = require('./speech');
var EventEmitter = require("events").EventEmitter;
var EventUtil = require('../util/Event');




// Public API
exports.get = _get;
exports.set = _set;
exports.start = _start;
exports.getById = _getById;
exports.setMostRecentCheckin = _setMostRecentCheckin;
exports.type = 'COLLECTION';

// Events Setup
exports.events = new EventEmitter();


function _start() {
	checkins.events.on('add', _onAddCheckin);
}

// Getters
function _get(callback) {
	log.debug('')
	database.getAll(UserModel, function(err, UserModels){
		if (err) {callback(err); return;}
		if (UserModels.length === 0) {callback(null, [])}
		var populatedUserModels = [];
		UserModels.forEach(function(UserModel){
			UserModel.populate('mostRecentCheckin', function(err, populatedUserModel){
				if (err) {callback(err); return;}
				populatedUserModels.push(populatedUserModel);
				if (populatedUserModels.length == UserModels.length) {
					callback(null, populatedUserModels)
				}
			});
		});
	});
};

// Setters

function _set(props, callback) {
	log.debug(props)

	if (!props._id) {
		// Create new user
		var user = new UserModel(props);
		database.save(user, function(error, savedUser){
			if (error) {log.error(error)}
			callback(error, savedUser);
		});
	} else {
		// TODO: Edit existing user
		callback(null, {})
	}

};



exports.getByUsername = function(username, callback) {
	database.findOne(UserModel, {'username': username}, callback);
}

exports.getByGeohopperName = function(geohopperName, callback) {
	database.findOne(UserModel, {'accounts.geohopper': geohopperName}, callback);
}

exports.getByFoursquareId = function(foursquareName, callback) {
	database.findOne(UserModel, {'accounts.foursquare': foursquareName}, callback);
}

// TODO: Not used yet.
exports.authenticate = function(username, password, callback) {
	_authenticate(username, password, callback);
};






// Utility Functions
function _getById(id, callback) {
	database.findOne(UserModel, {'_id': id}, callback);
};

function _authenticate(username, password){};


// This should all be moved into a generic setter.
function _setMostRecentCheckin(userId, checkin, callback){
	log.debug('Setting most recent checkin', checkin);
	_getById(userId, function(error, UserModel){
		if (error) {return;}

		if (checkin.name == 'Home' && checkin.action == 'ENTER') {
			// TODO Make sure we're not already home before announcing!
			//speech.say(UserModel.name.first + ' is arriving home')
			UserModel.isHome = true;
		} else {
			UserModel.isHome = false;
		}

		// Update User Model
		UserModel.mostRecentCheckin = checkin._id;
		database.save(UserModel, function(error, savedUserModel){
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


