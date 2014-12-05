define([
	'jquery',
	'underscore',
	'backbone',
	'text!./Device.html',
	'../Device'
], function(
	$,
	_,
	Backbone,
	templateString,
	Device
){




	return Backbone.View.extend({

		name: 'Device',

		initialize: function(params) {
			this.router = params.router;
			this._initializeTemplate();
			this.model.on("change", _.bind(this._onModelChange, this));
			this._updateDisplay();
			this._nameNode.addEventListener("click", _.bind(this._onNameNodeClick, this));
			this._stateNode.addEventListener("click", _.bind(this._onStateNodeClick, this));

			// Touch Events
			// this.$el.on("touchstart", _.bind(this._onTouchStart, this));
			// this.$el.on("touchend", _.bind(this._onTouchEnd, this));
			// this.$el.on("touchcancel", _.bind(this._onTouchCancel, this));
			// this.$el.on("touchleave", _.bind(this._onTouchLeave, this));
			// this.$el.on("touchmove", _.bind(this._onTouchMove, this));
		},


		_initializeTemplate: function () {
		
			// Consume template string
			if (templateString) {
				var templateDom = _.template(templateString);
				this.$el.html(templateDom);
				this.$el.addClass(this.name);
			};
			
			// Collect attach points
			if (this.$el) {
				$('[data-attach-point]', this.$el).each(_.bind(function(index, attachPointNode){
					var attachPointName = attachPointNode.attributes['data-attach-point'].value;
					this[attachPointName] = attachPointNode;
				}, this));
			};
			
		},

		placeAt: function(node) {
			node.appendChild(this.el);
		},

		_onStateNodeClick: function() {
			if (this._handleStateClick) {
				this._handleStateClick();
			}
		},

		_onNameNodeClick: function() {
			var deviceId = this.model.get('id');
			this.router.navigate('device/' + deviceId, {trigger: true});
		},

		_onModelChange: function () {
			this._updateDisplay();
		},

	// Private Events

		_onTouchStart: function() {
			console.log('_onTouchStart');
		},

		_onTouchEnd: function() {
			console.log('_onTouchEnd')
		},

		_onTouchCancel: function() {
			console.log('_onTouchCancel')
		},

		_onTouchLeave: function() {
			console.log('_onTouchLeave')
		},

		_onTouchMove: function() {
			console.log('_onTouchMove')
		},



	// Private Functions

		_updateDisplay: function () {
			this._nameNode.innerHTML = this.model.get('name');
			switch (this.model.get('category')) {
				case "light":
					//this._stateNode.innerHTML = this.model.get('displayLongState');
					var currentBrightness = this.model.get('brightness');
					$(this._stateNode).addClass('icon fa fa-lightbulb-o');
					$(this._stateNode).toggleClass('on', currentBrightness > 0);

					this._handleStateClick = function() {
						var currentBrightness = this.model.get('brightness');
						var newBrightness = currentBrightness > 0 ? 0 : 100;
						this.model.save({
						 	brightness: newBrightness
						}, {patch: true});
					}
					break;
				case 'thermostat':
					var isOn = this.model.get('hvacHeaterIsOn');
					$(this._stateNode).addClass('icon fa fa-fire');
					$(this._stateNode).toggleClass('on', isOn);
					break;
			}
		}

	});




});