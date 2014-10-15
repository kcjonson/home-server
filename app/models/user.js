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
	password: String,
	mostRecentCheckin: mongoose.Schema.Types.ObjectId
}).post('init', function(document){
	console.log('user init');
}).post('save', function(document){
	console.log('Finished Saving Changes to user object');
});


module.exports =  mongoose.model(config.USERS_COLLECTION, userSchema);