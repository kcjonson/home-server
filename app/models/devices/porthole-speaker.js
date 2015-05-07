var config = require('../../../config/devices.json');
var mongoose = require('mongoose');

var portholeSpeakerSchema = new mongoose.Schema({
	name: String,
	hardwareId: String,
	type: {
		type: String,
		default: 'PORTHOLE_SPEAKER'
	}
});

module.exports =  mongoose.model('PortholeSpeaker', portholeSpeakerSchema, config.DEVICES_COLLECTION);

