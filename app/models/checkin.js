var config = require('../../config/checkins.json');
var users = require('../lib/users');
var mongoose = require('mongoose');


var checkinSchema = new mongoose.Schema({
	name: String,
	date: Date,
	user: mongoose.Schema.Types.ObjectId,
	location: {
		lat: Number,
		lng: Number
	}
}).post('save', function(document){
	console.log('Finished saving changes to checkin object', document);
	if (document.user) {
		users.setMostRecentCheckin(document.user, this);
	}
});



module.exports =  mongoose.model(config.CHECKINS_COLLECTION, checkinSchema);