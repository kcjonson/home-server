define([
	'jquery',
	'underscore',
	'backbone',
	'text!./Actions.html',
	'./actions/Action'
], function(
	$,
	_,
	Backbone,
	templateString,
	Action
){
	
	
	

	return Backbone.View.extend({


	// Init
		name: 'Actions',
		attributes: {
			'class': 'scrollable'
		},

		initialize: function (args) {			
			this._initializeTemplate();
			//this._initializeModel();
			//this._createActions();

			this.indigoModel = args.indigoModel;
			this.indigoModel.on("change", _.bind(this._onIndigoModelChange, this));
			this._populateActionsList();
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

		show: function () {
			this.$el.removeClass('hidden');
		},

		hide: function () {
			this.$el.addClass('hidden');
		},

		_onIndigoModelChange: function() {
			console.log('Actions._onIndigoModelChange()', this.indigoModel);
			this._populateActionsList();
		},

		_populateActionsList: function (argument) {
			if (this.indigoModel) {
				var actionsCollection = this.indigoModel.get('actions');
				actionsCollection.forEach(function (actionModel) {
					var actionView = new Action({
						model: actionModel
					}).placeAt(this._actionsNode);
				}, this);
			}
		}


		
	});


	
});