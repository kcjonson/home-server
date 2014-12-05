define([
	'jquery',
	'underscore',
	'backbone',
	'app/View',
	'./device/Thermostat',
	'./device/Light',
	'text!./Device.html'
], function(
	$,
	_,
	Backbone,
	View,
	Thermostat,
	Light,
	templateString
){
	
	
	

	return View.extend({


	// Init
		name: 'Device',
		templateString: templateString,

		initialize: function(args) {
			this.indigoModel = args.indigoModel;
			View.prototype.initialize.call(this);
			//this.indigoModel.on("change", _.bind(this._onIndigoModelChange, this));
		},


		show: function(params) {
			View.prototype.show.call(this);
			if (params && params.length > 0) {
				var id = params[0];
				var model = this.indigoModel.get('devices').findWhere({id: id});
				if (model) {
					this._displayDevice(model);
				}
			}
		},


		_displayDevice: function(model) {
			var category = model.get('category');
			console.log('dm', model, category);
			this._nameNode.innerHTML = model.get('name');

			var detailsType;
			switch(category) {
				case 'thermostat':
					detailsType = Thermostat;
					break;
				case 'light':
					detailsType = Light;
					break;
			}

			if (this._detailsView) {
				this._detailsView.remove();
			}

			if (detailsType) {
				this._detailsView = new detailsType({
					model: model
				}).placeAt(this._detailsNode);
			}
		}





		
	});


	
});