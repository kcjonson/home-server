var config = require('../../lib/config');
var mongoose = require('mongoose');

var indigoSwitchSchema = new mongoose.Schema({
	name: String,
	hardwareId: String,
	category: String,
	location: String,
	type: {
		type: String,
		default: 'INDIGO_SWITCH'
	}
});

module.exports =  mongoose.model('IndigoSwitch', indigoSwitchSchema, config.get('DEVICES_COLLECTION'));

