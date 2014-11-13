define([
	'jquery',
	'underscore',
	'backbone',
	'backbone-relational'
], function(
	$,
	_,
	Backbone
){



	
	return Backbone.RelationalModel.extend({

		url: function() {
			return 'api/dashboard'
		},

		relations: [

		]

	
	});

});