var database = require('./database');
var checkinModel = require('../models/checkin');
var config = require('../../config/checkins.json');


exports.add = _add;
exports.getMostRecentByUserId = _getMostRecentByUserId;



function _add(data, callback) {


	if (!data.name) {
		data.name = config.CHECKINS_UNKNOWN_NAME;
	}

	console.log('Adding Checkin', data);

	var newCheckin = new checkinModel(data);
	database.save(newCheckin, function(error){
		console.log('Saved new checkin');
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

function _getMostRecentForAllUsers() {

}