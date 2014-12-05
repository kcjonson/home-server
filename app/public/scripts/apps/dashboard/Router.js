define([
	'jquery',
	'underscore',
	'backbone',
	'app/views/Dashboard',
	'app/views/Devices',
	'app/views/Actions',
	'app/views/Alarm',
	'app/views/Device'
], function(
	$,
	_,
	Backbone,
	Dashboard,
	Devices,
	Actions,
	Alarm,
	Device
){

	// Store the loaded views in an object,
	// so that we don't have to load them mutliple times.
	var views = {};


	return Backbone.Router.extend({

		routes: {
			'': 'Dashboard',
			'devices': 'Devices',
			'actions': 'Actions',
			'alarm': 'Alarm',
			'device/:device': 'Device'
		},
		
		initialize: function(args) {
			this.el = args.el;
			this.on('route', function(currentView, params) {

				// Create View if not Visited Yet.
				// Alternately, we could do this all at init.
				if (!views[currentView]) {
					var viewPrototype = eval(currentView);
					if (viewPrototype) {
						views[currentView] = new viewPrototype({
							indigoModel: args.indigoModel,
							router: this
						});
						this.el.append(views[currentView].$el);
					}
				}

				// Hide/Show Correct View
				for (var key in views) {
					if (views.hasOwnProperty(key)) {
						var v = views[key];
						if (v.name !== currentView) {
							v.hide();
						} else {
							v.show(params);
						}
					}
				}

				// Update Model
				args.indigoModel.fetch();

			})
		},

		Dashboard: function() {
			console.log('route to Dashboard');
		},

		Devices: function() {
			console.log('route to Devices');
		},

		Actions: function() {
			console.log('route to Actions');
		}
		
		
	});



	
});