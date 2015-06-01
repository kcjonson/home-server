var database = require('./database');
var userModel = require('../models/user');
var indigo = require('./indigo');
var checkins = require('./checkins');
var log = require('./log');
var speech = require('./speech');
var EventEmitter = require("events").EventEmitter;




// Setup
exports.events = new EventEmitter();
checkins.events.on('add', _onAddCheckin);


// Getters
exports.getAll = function(callback) {
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

exports.getById = _getById;

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

exports.setMostRecentCheckin = _setMostRecentCheckin;




// Utility Functions
function _getById(id, callback) {
	database.findOne(userModel, {'_id': id}, callback);
};

function _authenticate(username, password){};


function _setMostRecentCheckin(userId, checkin, callback){
	log.debug('Setting most recent checkin', checkin);
	_getById(userId, function(error, userModel){
		if (error) {return;}
		
		log.debug('Got user to save checkin', userModel, checkin.name);

		if (checkin.name == 'Home') {
			speech.say(userModel.name.first + ' is arriving home')
		}

		// This is super janky.
		var isAwayValue = true;
		var isAwayVariableName = "isAway" + userModel.accounts.indigo;
		if (checkin.name == 'Home') {
			log.debug('Checkin name is "Home"');
			isAwayValue = false;
		};
		indigo.setVariable(isAwayVariableName, isAwayValue, function(error, variableData){
			log.debug('finished saving changes to variable', error, variableData);
		});

		// Update User Model
		userModel.mostRecentCheckin = checkin._id;
		database.save(userModel, function(error, savedUserModel){});

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



