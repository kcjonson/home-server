var config = require('../../config/settings.json');
var mongoose = require('mongoose');

var settingSchema = new mongoose.Schema({
	street: String,
	city: String,
	state: String,
	zip: String
});

module.exports =  mongoose.model(config.SETTINGS_COLLECTION, settingSchema);


