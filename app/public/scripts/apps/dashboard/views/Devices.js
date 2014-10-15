define([
	'jquery',
	'underscore',
	'backbone',
	'text!./Devices.html',
	'./devices/Device'
], function(
	$,
	_,
	Backbone,
	templateString,
	Device
){
	
	
	

	return Backbone.View.extend({


	// Init
		name: 'Devices',

		initialize: function(args) {			
			this._initializeTemplate();

			this.indigoModel = args.indigoModel;
			this._populateDevicesList();
			this.indigoModel.on("change", _.bind(this._onIndigoModelChange, this));


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

		_populateDevicesList: function() {
			if (this.indigoModel) {
				var devicesCollection = this.indigoModel.get('devices');
				devicesCollection.forEach(function (deviceModel) {
					var deviceView = new Device({
						model: deviceModel
					}).placeAt(this._devicesNode);
				}, this);
			}
		},


		
	});


	
});