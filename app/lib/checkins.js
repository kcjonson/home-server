var database = require('./database');
var checkinModel = require('../models/checkin');


exports.add = _add;



function _add(data, callback) {
	var newCheckin = new checkinModel(data);
	database.save(newCheckin, function(error){
		console.log('saved new checkin');
		if (callback) {
			callback();
		}
	});
};

function _getMostRecent(){}

function _getMostRecentByUserId(userId) {}

function _getMostRecentForAllUsers() {

}