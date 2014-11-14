define([
	'jquery',
	'underscore',
	'backbone'
], function(
	$,
	_,
	Backbone
){



	return Backbone.View.extend({

		initialize: function(params) {

			var templateDom = _.template("<div class='Action'><span class='icon fa'></span><span class='label'></span></div>");
			this.$el.html(templateDom);

			$('.label', this.$el)[0].innerHTML = params.label;

			$('.icon', this.$el).addClass(params.icon);

			this._name = params.name;
			this.el.addEventListener("click", _.bind(this._onClick, this));
		},

		placeAt: function(node) {
			node.appendChild(this.el);
			return this;
		},

		_onClick: function() {
			$.get('/api/indigo/actions/' + this._name, {}).done(function(){
				console.log('success')
			}).fail(function(){
				console.log('fail')
			});
		}

	});







	// return Backbone.View.extend({

	// 	initialize: function(params) {
	// 		console.log('hello from action', arguments);
	// 		this.$el.html("<div class='action'></div>");

	// 		// TODO: Refactor
	// 		// Run setters on params
	// 		for (var key in params) {
	// 			if (params.hasOwnProperty(key)) {
	// 				this.set(key, params[key]);
	// 			}
	// 		}

	// 	},

	// 	// Public Params
	// 	// What to do here?
	// 	// _parameters: [
	// 	// 	label
	// 	// ],

	// 	_setters: {

	// 		label: function(value) {
	// 			console.log('running setter');
	// 			//this._set('label', value);
	// 			this.el.innerHTML = value;
	// 			return value;
	// 		},

	// 	},

	// 	_getters: {

	// 	},


	// // TODO: Extend view to handle this stuff

	// 	get: function(param) {
	// 		return this['_' + param] || undefined;
	// 	},

	// 	set: function(param, value) {
	// 		console.log('setting', param, value);

	// 		if (this._setters[param]) {
	// 			value = this._setters[param](value);
	// 		}
	// 		this._set(param, value);
	// 	},

	// 	on: function(event, callback) {

	// 	},

	// 	placeAt: function(node) {
	// 		node.appendChild(this.el);
	// 	},

	// 	_set: function(param, value) {
	// 		this['_' + param] = value;
	// 		// TODO: Fire event
	// 	},

	// 	_emit: function(event, params) {

	// 	}

	// });


});