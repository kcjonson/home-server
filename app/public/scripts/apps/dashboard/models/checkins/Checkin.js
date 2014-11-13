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
		urlRoot: 'api/checkins/checkin/',
		idAttribute: '_id'
	});

});