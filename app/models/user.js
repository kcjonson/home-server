var config = require('../lib/config');
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true,
		index: true
	},
	name: {
		first: String,
		last: String
	},
	accounts: {
		foursquare: {
			type: String,
			unique: true
		},
		geohopper:  {
			type: String,
			unique: true
		},
		indigo:  {
			type: String,
			unique: true
		}
	},
	password: String,
	mostRecentCheckin: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'checkins'
	},
	isHome: Boolean
})

module.exports =  mongoose.model(config.get('USERS_COLLECTION'), userSchema);