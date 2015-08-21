var config = require('../lib/config');
var mongoose = require('mongoose');

var settingSchema = new mongoose.Schema({
	street: String,
	city: String,
	state: String,
	zip: String,
	coordinates: {
		type: [Number], //[<longitude>, <latitude>]
		index: '2d'
	}
});

module.exports =  mongoose.model(config.get('SETTINGS_COLLECTION'), settingSchema);


