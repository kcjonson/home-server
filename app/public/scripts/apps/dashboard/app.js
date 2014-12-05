
SERVER = 'http://1825eglen.com/'

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
	'app/models/Indigo',
	'app/views/Navigation',
	'app/views/Header'
], function(
	Router,
	IndigoModel,
	Navigation,
	Header
){


	// Fun Hack for iOS
	document.addEventListener("touchstart", function() {},false);



	var indigoModel;
	var router;
	var navigation;
	var header;
	var started = false;


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

	function initRouter(argument) {
		router = new Router({
			indigoModel: indigoModel,
			el: $('body > .views')
		});
		navigation = new Navigation({
			el: $('body > .footer > .navigation'),
			router: router
		});
		header = new Header({
			el: $('body > .header'),
			router: router,
			indigoModel: indigoModel
		});
	};


	function start() {
		Backbone.history.start({
			root: '/home/',
			pushState: true
		});
		router.navigate('', { trigger: true });
		$('body').addClass('loaded');
		started = true;
	};



// Event Handlers

	function _onIndigoModelChange() {
		console.log('app._onIndigoModelChange()', indigoModel);
		if (!started) {
			start();
		}
	}

	function _onIndigoModelError(error) {
		console.log('app._onIndigoModelError()', error);
	}




});