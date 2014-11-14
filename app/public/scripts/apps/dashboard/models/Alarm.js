define([
	'jquery',
	'underscore',
	'backbone'
], function(
	$,
	_,
	Backbone
){
	
	return Backbone.Model.extend({
		urlRoot: SERVER + 'api/dashboard'
	
	});

});