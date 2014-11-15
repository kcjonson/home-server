define([
	'jquery',
	'underscore',
	'backbone',
	'text!./Navigation.html'
], function(
	$,
	_,
	Backbone,
	templateString
){


	return Backbone.View.extend({


	// Init
		name: 'Navigation',

		initialize: function(args) {
			this.router = args.router;	
			this._initializeTemplate();
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
				$('[data-route]', this.$el).each(_.bind(function(index, routeNode){
					var route = routeNode.attributes['data-route'].value;
					routeNode.addEventListener("click", _.bind(this._onRouteClick, this, route));
				}, this));
			};

		},

		_onRouteClick: function(route) {
			console.log('Route Click', route);
			this.router.navigate(route, {trigger: true});
		}



	});


	
});