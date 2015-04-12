var database = require('./database');
var checkinModel = require('../models/checkin');
var config = require('../../config/checkins.json');
var log = require('./log');


exports.add = _add;
exports.getByUserId = _getByUserId;
exports.getMostRecentByUserId = _getMostRecentByUserId;



function _add(data, callback) {

	if (!data.name) {
		data.name = config.CHECKINS_UNKNOWN_NAME;
	}

	//log.debug('app/lib/';
	log.debug(data);

	var newCheckin = new checkinModel(data);
	database.save(newCheckin, function(error){
		log.debug('Save Successful');
		if (callback) {
			callback();
		}
	});
};

function _getMostRecent(){}

function _getMostRecentByUserId(userId, callback) {
	console.log('_getMostRecentByUserId', userId);
	database.findOne(checkinModel, {user: userId}, callback);
}

// Get all checkins
// This will have to be limited at some point ... 
function _getByUserId(userId, callback) {
	database.find(checkinModel, {user: userId}, null, {sort: {date: -1}, limit: 100}, callback)
};

function _getMostRecentForAllUsers() {

}