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
		urlRoot: 'api/indigo/devices',
		idAttribute: 'name'



	
	});

});