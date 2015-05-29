var config = require('../../../config/devices.json');
var mongoose = require('mongoose');

var indigoDimmerSchema = new mongoose.Schema({
	name: String,
	hardwareId: String,
	category: String,
	location: String,
	type: {
		type: String,
		default: 'INDIGO_DIMMER'
	}
});

module.exports =  mongoose.model('IndigoDimmer', indigoDimmerSchema, config.DEVICES_COLLECTION);

