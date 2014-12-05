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
		'Bedtime': 'Upstairs',
		'Kitchen': 'Main Floor',
		'Living Room': 'Main Floor',
		'Pantry': 'Main Floor',
		'Office': 'Downstairs',
		'TV Room': 'Downstairs',
		'Movie': 'Downstairs',
		'Entry': 'Downstairs',
		'Downstairs': 'Downstairs',
		'Outside': 'Outside'
	};

	var NAME_TO_CATEGORIES_MAP = {
		'Dim': 'light',
		'Lights': 'light',
		'Temperature': 'thermostat',
		'KEXP': 'Audio',
		'AirPlay': 'Audio',
		'Pause': 'Audio'
	}



	return Backbone.RelationalModel.extend({
		urlRoot: SERVER + 'api/indigo/actions',
		idAttribute: 'name',

		execute: function() {
			console.log('Execute Action')
			console.log('models.indigo.Action.execute()');
			$.get(SERVER + 'api/indigo/actions/' + this.get('name'), {}).done(_.bind(this._onExecuteSuccess, this)).fail(_.bind(this._onExecuteSuccess, this));
		},

		_onExecuteSuccess: function() {
			console.log('models.indigo.Action._onExecuteSuccess()');
		},

		_onExcuteError: function(error) {
			console.log('models.indigo.Action._onExecuteError)', error);
		},

		get: function (attr) {
			if (typeof this[attr] == 'function') {
				return this[attr]();
			}
			return Backbone.RelationalModel.prototype.get.call(this, attr);
		},

		category: function() {
			var name = this.get('name');
			var category = 'unknown';
			for (var key in NAME_TO_CATEGORIES_MAP) {
				if (name.indexOf(key) > -1) {
					category = NAME_TO_CATEGORIES_MAP[key];
				}
			}
			return category;
		},

		location: function() {
			var name = this.get('name');
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