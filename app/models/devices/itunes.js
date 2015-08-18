var config = require('../../lib/config');
var mongoose = require('mongoose');

var iTunesSchema = new mongoose.Schema({
	name: String,
	hardwareId: String,
	category: String,
	location: String,
	type: {
		type: String,
		default: 'ITUNES'
	}
});

module.exports =  mongoose.model('ITunes', iTunesSchema, config.get('DEVICES_COLLECTION'));

