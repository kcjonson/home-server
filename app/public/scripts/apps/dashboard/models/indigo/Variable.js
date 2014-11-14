define([
	'jquery',
	'underscore',
	'backbone',
	'app/models/Indigo',
	'backbone-relational'
], function(
	$,
	_,
	Backbone,
	Indigo
){
	
	return Backbone.RelationalModel.extend({
		urlRoot: SERVER + 'api/indigo/variables',
		idAttribute: 'name'
	
	});

});