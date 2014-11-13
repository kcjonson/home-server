var config = require('../../config/users');
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
	password: String
});


module.exports =  mongoose.model(config.USERS_COLLECTION, userSchema);