var config = require('../../config/devices.json');
var mongoose = require('mongoose');

var deviceUpdateSchema = new mongoose.Schema({
	deviceId: mongoose.Schema.Types.ObjectId,
	property: String,
	value: String,
	time : { 
		type : Date, 
		default: Date.now 
	}
});

module.exports =  mongoose.model(config.DEVICES_UPDATES_COLLECTION, deviceUpdateSchema);