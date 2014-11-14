define([
	'jquery',
	'underscore',
	'backbone',
	'text!./Device.html'
], function(
	$,
	_,
	Backbone,
	templateString
){




	return Backbone.View.extend({

		name: 'Device',

		initialize: function(params) {
			this._initializeTemplate();
			this.model.on("change", _.bind(this._onModelChange, this));
			this._updateDisplay();
			this._nameNode.addEventListener("click", _.bind(this._onNameNodeClick, this));
			this._stateNode.addEventListener("click", _.bind(this._onStateNodeClick, this));
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
			
		},

		_onModelChange: function () {
			console.log(arguments);
			this._updateDisplay();
		},


		/* 

			This is admittedly, a huge mess.

		*/
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
			}
		}

	});




});