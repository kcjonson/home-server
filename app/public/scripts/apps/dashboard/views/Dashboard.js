define([
	'jquery',
	'underscore',
	'backbone',
	'text!./Dashboard.html',
	'./dashboard/Action',
	'app/models/Alarm',
	'app/models/Indigo'
], function(
	$,
	_,
	Backbone,
	templateString,
	Action,
	AlarmModel,
	IndigoModel
){
	
	
	

	return Backbone.View.extend({


	// Init
		name: 'Dashboard',

		initialize: function(args) {
			this.indigoModel = args.indigoModel;
			
			this._initializeTemplate();
			this._alarmStatusNode.addEventListener("click", _.bind(this._onAlarmStatusClick, this));

			this._updateDisplay();
			this.indigoModel.on('change', _.bind(this._onIndigoModelChange, this));

			this._createActions();

		},

		
		_initializeTemplate: function() {
		
			// Consume template string
			if (templateString) {
				var templateDom = _.template(templateString);
				this.$el.html(templateDom);
				this.$el.addClass(this.name);
			};
			
			// Collect attach points
			if (this.$el) {
				$('[data-attach-point]', this.$el).each(_.bind(function(index, attachPointNode){
					var attachPointName = attachPointNode.attributes['data-attach-point'].value;
					this[attachPointName] = attachPointNode;
				}, this));
			};
			
			
		},
		
		
		
		
	// Public Functions

		show: function() {
			console.log('show')
			this.$el.removeClass('hidden');
		},

		hide: function() {
			this.$el.addClass('hidden');
		},
		
	
	// User Event Handlers
	
		_onAlarmStatusClick: function() {
			
			var alarmOnModel = this.indigoModel.get('variables').findWhere({name: 'AlarmOn'});
			var alarmRunningModel = this.indigoModel.get('variables').findWhere({name: 'AlarmRunning'});
			var isRunning = alarmRunningModel.get('value');
			var isOn = alarmOnModel.get('value') == true;

			// TEMP HACK
			alarmOnModel.on("change", _.bind(this._onIndigoModelChange, this));
			alarmRunningModel.on("change", _.bind(this._onIndigoModelChange, this));

			if (isRunning) {
				alarmRunningModel.save({
					value: false
				}, {patch: true});
			} else {
				alarmOnModel.save({
					value: !isOn
				}, {patch: true});
			};

		},
		
		
		
	// Data Event Handlers

		_onIndigoModelChange: function(model) {
			//console.log('IndigoModel:change', model);
			this._updateDisplay();
		},



	// Private

		_updateDisplay: function() {
			var variables = this.indigoModel.get('variables');
			var hour = variables.findWhere({name: 'AlarmHour'}).get('value');
			var minute = variables.findWhere({name: 'AlarmMinute'}).get('value');
			var isOn = variables.findWhere({name: 'AlarmOn'}).get('value');
			var isRunning = variables.findWhere({name: 'AlarmRunning'}).get('value');

			if (hour && minute) {
				this._alarmTimeNode.innerHTML = hour + ':' + minute;
			}	
			$(this._alarmIsOnNode).toggleClass('true', isOn);
			$(this._alarmIsOnNode).toggleClass('hidden', isRunning);
			$(this._alarmIsRunningNode).toggleClass('hidden', !isRunning);
		},

		_createActions: function() {
			var actions = [
				{
					name: 'Turn Off All Lights',
					label: 'Lights Off',
					icon: 'fa-lightbulb-o'
				},
				{
					name: 'Set Movie Mood',
					label: 'Movie Mood',
					icon: 'fa-film'
				},
				{
					name: 'Set Bedtime Mood',
					label: 'Bedtime Mood',
					icon: 'fa-cloud'
				},
				{
					name: 'Turn On All Lights',
					label: 'Lights On',
					icon: 'fa-lightbulb-o'
				}
			].forEach(function(actionParams){
				var action = new Action(actionParams).placeAt(this._actionsNode);
			}, this);
		}

	});


	
});