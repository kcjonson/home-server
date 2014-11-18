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
		urlRoot: SERVER + 'api/indigo/actions',
		idAttribute: 'name',

		execute: function() {
			console.log('Execute Action')
			console.log('models.indigo.Action.execute()');
			$.get(SERVER + 'api/indigo/actions/' + this.get('name'), {}).done(_.bind(this._onExecuteSuccess, this)).fail(_.bind(this._onExecuteSuccess, this));
		},

		_onExecuteSuccess: function() {
			console.log('models.indigo.Action._onExecuteSuccess()');
		},

		_onExcuteError: function(error) {
			console.log('models.indigo.Action._onExecuteError)', error);
		},


	
	});

});