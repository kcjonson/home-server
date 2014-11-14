define([
	'jquery',
	'underscore',
	'backbone',
	'app/models/indigo/Variable',
	'app/models/indigo/Variables',
	'app/models/indigo/Action',
	'app/models/indigo/Actions',
	'app/models/indigo/Device',
	'app/models/indigo/Devices',
	'backbone-relational'
], function(
	$,
	_,
	Backbone,
	Variable,
	Variables,
	Action,
	Actions,
	Device,
	Devices
){



	
	return Backbone.RelationalModel.extend({

		url: function() {
			return SERVER + 'api/indigo'
		},

		relations: [
			{
				key: 'variables',
				type: Backbone.HasMany,
				collectionType: Variables,
				relatedModel: Variable
			},
			{
				key: 'actions',
				type: Backbone.HasMany,
				collectionType: Actions,
				relatedModel: Action
			},
			{
				key: 'devices',
				type: Backbone.HasMany,
				collectionType: Devices,
				relatedModel: Device
			}
		]

	
	});

});