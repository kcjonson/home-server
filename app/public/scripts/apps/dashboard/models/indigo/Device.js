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


	var NAME_TO_LOCATIONS_MAP = {
		'Master Bathroom': 'Upstairs',
		'Master Bedroom': 'Upstairs',
		'Upstairs': 'Upstairs',
		'Kitchen': 'Main Floor',
		'Living Room': 'Main Floor',
		'Pantry': 'Main Floor',
		'Office': 'Downstairs',
		'TV Room': 'Downstairs',
		'Entry': 'Downstairs',
		'Downstairs': 'Downstairs',
		'Outside': 'Outside'
	};



	
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
		},

		location: function() {
			var name = this.get('name');

			// This is total hack.
			// Should probally be moved to the backend.
			var location = 'unknown';
			for (var key in NAME_TO_LOCATIONS_MAP) {
				if (name.indexOf(key) > -1) {
					location = NAME_TO_LOCATIONS_MAP[key];
				}
			}
			return location;

		}


	
	});

});