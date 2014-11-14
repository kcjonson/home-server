define([
	'jquery',
	'underscore',
	'backbone',
	'backbone-relational'
], function(
	$,
	_,
	Backbone
){
	
	return Backbone.RelationalModel.extend({
		urlRoot: SERVER + 'api/indigo/devices',
		idAttribute: 'name',

		get: function (attr) {
			if (typeof this[attr] == 'function') {
				return this[attr]();
			}
			return Backbone.RelationalModel.prototype.get.call(this, attr);
		},

		category: function() {
			switch (this.get('type')) {
				case "SwitchLinc Dimmer":
				case "SwitchLinc Dimmer (dual-band)":
				case "LampLinc":
					return 'light';
					break;
				case "Nest Thermostat Module":
					return 'thermostat';
					break;
				case "SwitchLinc Relay":
					return 'switch'
					break;
				default:
					return 'unknown'
			}
		}


	
	});

});