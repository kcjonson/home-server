var config = require('../../../config/devices.json');
var mongoose = require('mongoose');

var indigoSwitchSchema = new mongoose.Schema({
	name: String,
	hardwareId: String,
	type: {
		type: String,
		default: 'INDIGO_SWITCH'
	}
});

module.exports =  mongoose.model('IndigoSwitch', indigoSwitchSchema, config.DEVICES_COLLECTION);

