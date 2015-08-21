var config = require('../lib/config');
var users = require('../lib/users');
var mongoose = require('mongoose');
var log = require('../lib/log');


var checkinSchema = new mongoose.Schema({
	name: String,
	date: Date,
	user: mongoose.Schema.Types.ObjectId,
	coordinates: {
		type: [Number], //[<longitude>, <latitude>]
		index: '2d'
	},
	action: String,
	source: String
}).post('save', function(document){
	log.debug('Finished saving changes to checkin object', document);
	if (document.user) {
		users.setMostRecentCheckin(document.user, document);
	}
});

module.exports =  mongoose.model(config.get('CHECKINS_COLLECTION'), checkinSchema);