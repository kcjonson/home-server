var config = require('../../../config/devices.json');
var mongoose = require('mongoose');

var iTunesSchema = new mongoose.Schema({
	name: String,
	hardwareId: String,
	type: {
		type: String,
		default: 'ITUNES'
	}
});

module.exports =  mongoose.model('ITunes', iTunesSchema, config.DEVICES_COLLECTION);

