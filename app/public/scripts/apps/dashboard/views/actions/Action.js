define([
	'jquery',
	'underscore',
	'backbone',
	'text!./Action.html'
], function(
	$,
	_,
	Backbone,
	templateString
){




	return Backbone.View.extend({

		name: 'Action',

		initialize: function(params) {
			this._initializeTemplate();
			this.model.on("change", _.bind(this._onModelChange, this));
			this._updateDisplay();
			this.el.addEventListener("click", _.bind(this._onClick, this));
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
			return this;
		},

		_onClick: function() {
			this.model.execute();
		},

		_onModelChange: function () {
			this._updateDisplay();
		},

		_updateDisplay: function (argument) {
			this._labelNode.innerHTML = this.model.get('name');
		}

	});




});