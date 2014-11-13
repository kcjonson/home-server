var database = require('./database');
var userModel = require('../models/user');
var indigo = require('./indigo');



// Getters

exports.getAll = function(callback) {
	database.getAll(userModel, callback);
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

// TODO, then exclude password from _findOne
function _authenticate(username, password){};


function _setMostRecentCheckin(userId, checkin, callback){
	console.log('Setting current checkin');
	_getById(userId, function(error, userModel){

		// This is super janky.
		var isAwayValue = true;
		var isAwayVariableName = "isAway" + userModel.accounts.indigo;
		if (checkin.name !== 'Home') {
			isAwayValue == false;
		}

		// Update Indigo Variable
		indigo.setVariable(isAwayVariableName, isAwayValue, function(error, variableData){});

		// Update User Model
		userModel.mostRecentCheckin = checkin._Id;
		database.save(userModel, function(error, savedUserModel){});

	});
};



