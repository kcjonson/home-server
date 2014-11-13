var database = require('./database');
var checkinModel = require('../models/checkin');


exports.add = _add;
exports.getMostRecentByUserId = _getMostRecentByUserId;



function _add(data, callback) {

	if (!data.name) {
		data.name = 'Unknown';  // Theres got to be a better way to do this.
	}

	var newCheckin = new checkinModel(data);
	database.save(newCheckin, function(error){
		console.log('saved new checkin');
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