
var indigo = require('../indigo');
var EventUtil = require('../../util/Event');

exports.start = _start;

function _start(LISTENERS) {

	indigo.start();

	// Run the getter on the indigo device lib that this is "mixed in to", which will return
	// all the devices.  Attach event handlers from the indigo lib (which is recieving them)
	// from the indigo controller, and pipe them through.
	this.get(function(err, devicesData){
		devicesData.forEach(function(deviceData){
			var deviceEventName = "change[" + deviceData.hardwareId + "]";
			if (LISTENERS[deviceData.hardwareId]) {
				indigo.events.removeListener(deviceEventName, LISTENERS[deviceData.hardwareId])
			}
			LISTENERS[deviceData.hardwareId] = indigo.events.on(deviceEventName, function(indigoEventData){
				this.get(indigoEventData.id, function(err, deviceData){
					if (!err) {
						EventUtil.emit(this.events, {
							name: 'change',
							id: indigoEventData.id,
							data: deviceData,
							property: indigoEventData.property
						});
					};
				}.bind(this));
			}.bind(this));
		}.bind(this));
	}.bind(this));
};

