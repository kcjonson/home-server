define([
	'jquery',
	'underscore',
	'backbone',
	'text!./Devices.html',
	'./devices/Category'
], function(
	$,
	_,
	Backbone,
	templateString,
	Category
){


	return Backbone.View.extend({


	// Init
		name: 'Devices',
		attributes: {
			'class': 'scrollable'
		},

		initialize: function(args) {	
			this._initializeTemplate();
			this.router = args.router;
			this.indigoModel = args.indigoModel;
			this._populateDevicesList();
			this.indigoModel.on("change", _.bind(this._onIndigoModelChange, this));
			$(this._typeInput).on("change", _.bind(this._onGroupingChange, this));
			$(this._locationInput).on("change", _.bind(this._onGroupingChange, this));
		},

		
		_initializeTemplate: function() {
		
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

		show: function() {
			this.$el.removeClass('hidden');
		},

		hide: function() {
			this.$el.addClass('hidden');
		},

		_onIndigoModelChange: function() {
			this._populateDevicesList();
		},

		_onGroupingChange: function() {
			this._populateDevicesList();
		},

		_populateDevicesList: function() {
			if (this.indigoModel) {
				var devicesCollection = this.indigoModel.get('devices');
				var actionsCollection = this.indigoModel.get('actions');

				for (var key in this._categoryViews) {
					if (this._categoryViews.hasOwnProperty(key)) {
						this._categoryViews[key].remove();
					}
				}
				this._categoryViews = {};

				var grouping = $("input:radio[name=devicesGrouping]:checked").val() || 'location';
				
				actionsCollection.forEach(function (actionModel) {
					var category = actionModel.get(grouping) || 'unknown';
					if (category !== 'unknown') {
						this._checkAndCreateCategory(category);
						this._categoryViews[category].addAction(actionModel);
					}
				}, this);

				devicesCollection.forEach(function (deviceModel) {
					var category = deviceModel.get(grouping) || 'unknown';
					this._checkAndCreateCategory(category)
					this._categoryViews[category].addDevice(deviceModel);
				}, this);
			}
		},

		_checkAndCreateCategory: function(category) {
			if (!this._categoryViews[category]) {
				this._categoryViews[category] = new Category({
					title: category,
					router: this.router
				}).placeAt(this._categoriesNode);
			};
		}


		
	});


	
});