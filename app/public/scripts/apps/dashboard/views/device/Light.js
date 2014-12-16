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
	


	var DEBUG = false;


	

	return View.extend({


	// Init
		name: 'Light',
		templateString: templateString,

		initialize: function(args) {
			this.model = args.model;
			View.prototype.initialize.call(this);
			this._takeMeasurements();
			this._updateDisplay();

			this.model.on("change", _.bind(this._onModelChange, this));

			// 
			this._onNode.addEventListener("click", _.bind(this._onOnNodeClick, this));
			this._offNode.addEventListener("click", _.bind(this._onOffNodeClick, this));

			// Touch Events
			this.$el.on("touchstart", _.bind(this._onTouchStart, this));
			this.$el.on("touchend", _.bind(this._onTouchEnd, this));
			this.$el.on("touchcancel", _.bind(this._onTouchCancel, this));
			this.$el.on("touchleave", _.bind(this._onTouchLeave, this));
			this.$el.on("touchmove", _.bind(this._onTouchMove, this));
		},


	// Private Events

		_onTouchStart: function(e) {
			//console.log('_onTouchStart');
			this._touchInitialX = e.originalEvent.touches[0].pageX;
			this._touchInitialY = e.originalEvent.touches[0].pageY;
			this._takeMeasurements();
		},

		_onTouchEnd: function() {
			//console.log('_onTouchEnd')
			this._touchInitialX = null;
			this._touchInitialY = null;
			this._setBrightness(Math.round(this._knobPercent));
		},

		_onTouchCancel: function() {
			//console.log('_onTouchCancel')
			this._touchInitialX = null;
			this._touchInitialY = null;
		},

		_onTouchLeave: function() {
			//console.log('_onTouchLeave')
		},

		_onTouchMove: function(e) {
			//console.log('_onTouchMove')

			this._controlRect = this._controlNode.getBoundingClientRect();

			var touchCurrentX = e.originalEvent.touches[0].pageX;
			var touchCurrentY = e.originalEvent.touches[0].pageY;

			var touchLocalX = touchCurrentX - this._controlRect.left;
			var touchLocalY = touchCurrentY  - this._controlRect.top;

			var deltaX = touchLocalX - this._knobCenterX;
			var deltaY = touchLocalY - this._knobCenterY;

			// Calculate the angle of degrees
			// Straight down is the "origin", or zero degrees
			// Degrees get greater in a counter clockwise rotation (or lesser in the oppisite)
			// atan2 returns it's results in radians, but does properly handle negitive vals
			var touchAngleRadians = Math.atan2(deltaX, deltaY);
			var touchAngleDegrees = touchAngleRadians * (180 / Math.PI);
			var touchAngleDegrees = touchAngleDegrees < 0 ? touchAngleDegrees += 360 : touchAngleDegrees;

			// Calculate percentage
			// We want 315deg to be 0, and 45deg to be 100
			var touchPercentage;
			if (touchAngleDegrees > 315) {
				touchPercentage = 0;
			} else if (touchAngleDegrees < 45) {
				touchPercentage = 100;
			} else {
				// This is the equation for the slope of a line:  y = mx + b
				touchPercentage = (touchAngleDegrees * (-10/27)) + (350/3);
			}

			this._updateKnobFromPercent(touchPercentage);

			if (DEBUG) {
				$(this._destinationNode).removeClass('hidden');
				$(this._destinationNode).css('left', touchLocalX + 'px')
				$(this._destinationNode).css('top', touchLocalY + 'px')
			}
		},

		_onModelChange: function () {
			this._updateDisplay();
		},

		_onOnNodeClick: function() {
			this._setBrightness(100);
		},

		_onOffNodeClick: function() {
			this._setBrightness(0);
		},

	// Private Functions

		_updateDisplay: function() {
			var brightness = this.model.get('brightness');
			this._brightnessNode.innerHTML = brightness;
			this._updateKnobFromPercent(brightness);

			// Update Gauge
			var gaugeRotation = this._calculateRoationFromPercent(brightness);
			$(this._gaugeFillArea).css('transform', 'rotate('+gaugeRotation+'deg)');
			if (gaugeRotation < -180) {
				$(this._gaugeOuterGroup).attr('clip-path', 'url(#gauge-clip-subtraction-small)');
			} else if (gaugeRotation < -90) {
				$(this._gaugeOuterGroup).attr('clip-path', 'url(#gauge-clip-subtraction-medium)');
			} else {
				$(this._gaugeOuterGroup).removeAttr('clip-path');
			}

			// Disable Buttons
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

		_updateGauge: function() {
			

		},

		_takeMeasurements: function() {

			// Read Coordinates.  Thise are relative to the bounding client, so we
			// have to be careful on the math to the relative position.  Don't forget
			// that the control node creates it own bounding rect for the css abs.
			var knobRect = this._knobGroup.getBoundingClientRect();
			this._controlRect = this._controlNode.getBoundingClientRect();

			this._knobCenterX = (knobRect.left + knobRect.width / 2) - this._controlRect.left;
			this._knobCenterY = (knobRect.top + knobRect.width / 2) - this._controlRect.top;

			// Holding all this stuff in your head is a way to get a headache, this
			// turns on some additional drawing.
			if (DEBUG) {
				$(this._originNode).removeClass('hidden');
				$(this._originNode).css('left', this._knobCenterX + 'px')
				$(this._originNode).css('top', this._knobCenterY + 'px')
			}
		},

		_setBrightness: function(brightness) {
			this.model.save({
				brightness: brightness
			}, {patch: true});
		},

		_updateKnobFromPercent: function(percent) {
			this._knobPercent = percent;
			this._knobRotation = this._calculateRoationFromPercent(percent);
			$(this._knobGroup).css('transform', 'rotate('+this._knobRotation+'deg)');
		},

		_calculateRoationFromPercent: function(percent) {
			return (-(270 - ((percent / 100) * 270)));
		}



		
	});


	
});