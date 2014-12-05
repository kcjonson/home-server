define([
	'jquery',
	'underscore',
	'backbone',
], function(
	$,
	_,
	Backbone
){
	
	
	

	return Backbone.View.extend({

		initialize: function(args) {
			this._initializeTemplate();
		},

		_initializeTemplate: function() {
			// Consume template string
			if (this.templateString) {
				var templateDom = _.template(this.templateString);
				this.$el.html(templateDom);
				this.$el.addClass(this.name);
			} else {
				throw new Error('View Requires a templateString');
			}
			
			// Collect attach points
			if (this.$el) {
				$('[data-attach-point]', this.$el).each(_.bind(function(index, attachPointNode){
					var attachPointName = attachPointNode.attributes['data-attach-point'].value;
					this[attachPointName] = attachPointNode;
				}, this));
			};
		},

		show: function(params) {
			this.$el.removeClass('hidden');
		},

		hide: function() {
			this.$el.addClass('hidden');
		},

		placeAt: function(node) {
			node.appendChild(this.el);
			return this;
		},


		
	});


	
});