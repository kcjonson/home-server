var config = require('../../lib/config');
var mongoose = require('mongoose');

var nestSchema = new mongoose.Schema({
	name: String,
	hardwareId: String,
	category: String,
	location: String,
	type: {
		type: String,
		default: 'NEST_THERMOSTAT'
	}
});

module.exports =  mongoose.model('NestThermostat', nestSchema, config.get('DEVICES_COLLECTION'));

