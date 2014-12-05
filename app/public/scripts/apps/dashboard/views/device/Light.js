define([
	'jquery',
	'underscore',
	'backbone',
	'app/View',
	'text!./Light.html'
], function(
	$,
	_,
	Backbone,
	View,
	templateString
){
	
	
	

	return View.extend({


	// Init
		name: 'Light',
		templateString: templateString,

		initialize: function(args) {
			this.model = args.model;
			View.prototype.initialize.call(this);
			this._updateDisplay();
			this.model.on("change", _.bind(this._onModelChange, this));
			this._onNode.addEventListener("click", _.bind(this._onOnNodeClick, this));
			this._offNode.addEventListener("click", _.bind(this._onOffNodeClick, this));
			this._rangeNode.addEventListener("change", _.bind(this._onRangeNodeChange, this));
			this._rangeNode.addEventListener("input", _.bind(this._onRangeNodeInput, this));
		},

		_onModelChange: function () {
			this._updateDisplay();
		},

		_onRangeNodeInput: function() {
			this._brightnessNode.innerHTML = this._rangeNode.value;
		},

		_onRangeNodeChange: function() {
			this._setBrightness(this._rangeNode.value);
		},

		_onOnNodeClick: function() {
			this._setBrightness(100);
		},

		_onOffNodeClick: function() {
			this._setBrightness(0);
		},

		_updateDisplay: function() {
			var brightness = this.model.get('brightness');
			this._brightnessNode.innerHTML = brightness;
			this._rangeNode.value = brightness;
			if (brightness == 100) {
				$(this._onNode).attr('disabled', 'disabled');
			} else {
				$(this._onNode).removeAttr('disabled');
			}
			if (brightness == 0) {
				$(this._offNode).attr('disabled', 'disabled');
			} else {
				$(this._offNode).removeAttr('disabled');
			}

		},

		_setBrightness: function(brightness) {
			this.model.save({
				brightness: brightness
			}, {patch: true});
		}



		
	});


	
});