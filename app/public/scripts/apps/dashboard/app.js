
require.config({
	baseUrl: 'scripts',
	paths: {
		app: 'apps/dashboard'
	},
	shim: {
		underscore: {
			exports: '_'
		},
		backbone: {
			deps: ["underscore", "jquery"],
			exports: "Backbone"
		},
		'backbone-relational': {
			deps: ["backbone"]
		}
	}
});

require([
	'app/Router',
	'app/models/Indigo'
], function(
	Router,
	IndigoModel
){


	var indigoModel,
		router;



	initModel();
	initRouter();
	


// Init Methods

	function initModel() {
		indigoModel = new IndigoModel({
			id: '1',
			variables: [
				{name: 'AlarmOn'},
				{name: 'AlarmRunning'},
				{name: 'AlarmHour'},
				{name: 'AlarmMinute'}
			]
		});
		indigoModel.on("change", _.bind(_onIndigoModelChange, this));
		indigoModel.on("error", _.bind(_onIndigoModelError, this));
		indigoModel.fetch();
	}

	function initRouter (argument) {
		router = new Router({
			indigoModel: indigoModel,
			el: $('body > .content')
		});

		Backbone.history.start({
			root: '/home/'
		});
	}


// Event Handlers

	function _onIndigoModelChange() {
		console.log('app._onIndigoModelChange()', indigoModel);
	}

	function _onIndigoModelError(error) {
		console.log('app._onIndigoModelError()', error);
	}



});