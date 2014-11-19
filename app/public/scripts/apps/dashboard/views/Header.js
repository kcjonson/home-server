define([
	'jquery',
	'underscore',
	'backbone',
	'text!./Header.html'
], function(
	$,
	_,
	Backbone,
	templateString
){


	return Backbone.View.extend({


	// Init
		name: 'Header',

		initialize: function(args) {
			this.router = args.router;	
			this._initializeTemplate();

			this.router.on("route", _.bind(function(route, params) {
			    this._titleNode.innerHTML = route; 
			}, this));

		},
		
		_initializeTemplate: function() {
		
			// Consume template string
			if (templateString) {
				var templateDom = _.template(templateString);
				this.$el.html(templateDom);
				this.$el.addClass(this.name);
			};
			
			// Collect attach points and Routes
			if (this.$el) {
				$('[data-attach-point]', this.$el).each(_.bind(function(index, attachPointNode){
					var attachPointName = attachPointNode.attributes['data-attach-point'].value;
					this[attachPointName] = attachPointNode;
				}, this));
			};

		}


	});


	
});