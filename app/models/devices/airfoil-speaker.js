var config = require('../../../config/devices.json');
var mongoose = require('mongoose');

var airfoilSpeakerSchema = new mongoose.Schema({
	name: String,
	hardwareId: String,
	category: String,
	location: String,
	type: {
		type: String,
		default: 'AIRFOIL_SPEAKER'
	}
});

module.exports =  mongoose.model('AirfoilSpeaker', airfoilSpeakerSchema, config.DEVICES_COLLECTION);

