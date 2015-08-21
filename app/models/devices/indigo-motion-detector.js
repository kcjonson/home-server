var config = require('../../lib/config');
var mongoose = require('mongoose');

var indigoMotionDetectorSchema = new mongoose.Schema({
	name: String,
	hardwareId: String,
	category: String,
	location: String,
	type: {
		type: String,
		default: 'INDIGO_MOTION_DETECTOR'
	}
});

module.exports =  mongoose.model('IndigoMotionDetector', indigoMotionDetectorSchema, config.get('DEVICES_COLLECTION'));

