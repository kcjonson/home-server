var config = require('../lib/config');
var mongoose = require('mongoose');

var alarmSchema = new mongoose.Schema({
	hour: Number,
	minute: Number,
	isOn: Boolean,
	running: Boolean
});

module.exports =  mongoose.model(config.get('ALARMS_COLLECTION'), alarmSchema);


