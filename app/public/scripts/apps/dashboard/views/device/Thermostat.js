define([
	'jquery',
	'underscore',
	'backbone',
	'app/View',
	'text!./Thermostat.html'
], function(
	$,
	_,
	Backbone,
	View,
	templateString
){
	
	
	

	return View.extend({


	// Init
		name: 'Thermostat',
		templateString: templateString,

		initialize: function(args) {
			this.model = args.model;
			View.prototype.initialize.call(this);
			this._updateDisplay();
		},

		_updateDisplay: function() {
			var isOn = this.model.get('hvacHeaterIsOn');
			this._currentTempNode.innerHTML = this.model.get('displayRawState');
			this._setTempNode.innerHTML = this.model.get('setpointHeat');
			$(this._setTempNode).toggleClass('hidden', !isOn);
		}



		
	});


	
});