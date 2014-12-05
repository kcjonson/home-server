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
			this.indigoModel = args.indigoModel;
			this._initializeTemplate();

			this.router.on("route", _.bind(function(route, params) {
			    this._titleNode.innerHTML = route; 
			}, this));

			this.indigoModel.on("request", _.bind(this._onIndigoModelRequest, this));
			this.indigoModel.on("sync", _.bind(this._onIndigoModelSync, this));

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

		},

		_onIndigoModelRequest: function (model, xhr, options) {
			//console.log('app._onIndigoModelRequest()', model, xhr, options);
			$(this._statusNode).removeClass('hidden');
		},

		_onIndigoModelSync: function (model, response, options) {
			//console.log('app._onIndigoModelRequest()', model, response, options);
			$(this._statusNode).addClass('hidden');
		}


	});


	
});