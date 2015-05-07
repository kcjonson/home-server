var config = require('../../../config/devices.json');
var mongoose = require('mongoose');

var indigoMotionDetectorSchema = new mongoose.Schema({
	name: String,
	hardwareId: String,
	type: {
		type: String,
		default: 'INDIGO_MOTION_DETECTOR'
	}
});

module.exports =  mongoose.model('IndigoMotionDetector', indigoMotionDetectorSchema, config.DEVICES_COLLECTION);

