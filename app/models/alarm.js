var config = require('../../config/alarms.json');
var mongoose = require('mongoose');

var alarmSchema = new mongoose.Schema({
	hour: Number,
	minute: Number,
	isOn: Boolean,
	running: Boolean
});

module.exports =  mongoose.model(config.ALARMS_COLLECTION, alarmSchema);


