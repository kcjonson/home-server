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
			return SERVER + 'api/checkins'
		},

		relations: [

		]

	
	});

});