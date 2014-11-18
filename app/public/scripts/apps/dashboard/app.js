
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
	'app/views/Navigation'
], function(
	Router,
	IndigoModel,
	Navigation
){


	// Fun Hack for iOS
	document.addEventListener("touchstart", function() {},false);



	var indigoModel;
	var router;
	var navigation;
	var started = false;


	initModel();
	initRouter();


	// $('body').bind("touchmove", {}, function(event){
	// 	event.preventDefault();
	// });

// var selScrollable = '.scrollable';
// // Uses document because document will be topmost level in bubbling
// $(document).on('touchmove',function(e){
//   e.preventDefault();
// });
// // Uses body because jQuery on events are called off of the element they are
// // added to, so bubbling would not work if we used document instead.
// $('body').on('touchstart', selScrollable, function(e) {
//   if (e.currentTarget.scrollTop === 0) {
//     e.currentTarget.scrollTop = 1;
//   } else if (e.currentTarget.scrollHeight === e.currentTarget.scrollTop + e.currentTarget.offsetHeight) {
//     e.currentTarget.scrollTop -= 1;
//   }
// });
// // Stops preventDefault from being called on document if it sees a scrollable div
// $('body').on('touchmove', selScrollable, function(e) {
//   e.stopPropagation();
// });



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
	};


	function start () {
		Backbone.history.start({
			root: '/home/',
			pushState: true
		});
		$('body').addClass('loaded');
		started = true;
	};


// Event Handlers

	function _onIndigoModelChange () {
		console.log('app._onIndigoModelChange()', indigoModel);
		if (!started) {
			start();
		}
	}

	function _onIndigoModelError (error) {
		console.log('app._onIndigoModelError()', error);
	}



});