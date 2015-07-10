
var indigo = require('../indigo');
var EventUtil = require('../../util/Event');



exports.start = _start;



function _start(LISTENERS) {
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

