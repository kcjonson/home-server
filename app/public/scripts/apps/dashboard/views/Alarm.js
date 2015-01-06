define([
	'jquery',
	'underscore',
	'backbone',
	'text!./Alarm.html',
	'app/models/Indigo'
], function(
	$,
	_,
	Backbone,
	templateString,
	IndigoModel
){


	return Backbone.View.extend({


	// Init
		name: 'Alarm',

		initialize: function(args) {
			this.indigoModel = args.indigoModel;
			this._initializeTemplate();
			this.indigoModel.on('change', _.bind(this._onIndigoModelChange, this));
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
				$('[data-adjust-time]', this.$el).each(_.bind(function(index, adjustTimeNode){
					adjustTimeNode.addEventListener("click", _.bind(this._onAdjustTimeClick, this, adjustTimeNode));
				}, this));
			};
			
		},



	// Public Functions

		show: function() {
			//console.log('show')
			this._updateDisplay();
			this.$el.removeClass('hidden');
		},

		hide: function() {
			this.$el.addClass('hidden');
		},

	// Private Events

		_onAdjustTimeClick: function(node) {
			var type = node.dataset.adjustType;
			var value = parseInt(node.dataset.adjustValue, 10);
			var date = this._getDateFromModel();
			switch (type) {
				case 'hours':
					date.setHours(date.getHours() + value);
					break;
				case 'minutes':
					date.setMinutes(date.getMinutes() + value);
					break;
			}
			var variables = this.indigoModel.get('variables');

			// Set Hours
			var hourModel = variables.findWhere({name: 'AlarmHour'});
			hourModel.save({
				value: date.getHours()
			}, {patch: true});

			// Set Minutes
			var minuteModel = variables.findWhere({name: 'AlarmMinute'});
			minuteModel.save({
				value: date.getMinutes()
			}, {patch: true});

			// Turn the alarm on with any changes
			var alarmOnModel = this.indigoModel.get('variables').findWhere({name: 'AlarmOn'});
			var isOn = alarmOnModel.get('value')
			if (!isOn) {
				alarmOnModel.save({
					value: true
				}, {patch: true});
			}

			// The models are not being watched, do it manually.
			this._updateDisplay();
		},

		_onIndigoModelChange: function() {
			this._updateDisplay();
		},


	// Private Functions

		_updateDisplay: function() {
			var date = this._getDateFromModel();
			var hour = date.getHours();
			var minute = date.getMinutes();
			if (minute.toString().length < 2) {
				minute = "0" + minute;
			}
			this._timeNode.innerHTML = hour + ":" + minute;
		},

		_getDateFromModel: function() {
			var variables = this.indigoModel.get('variables');
			var hour = parseInt(variables.findWhere({name: 'AlarmHour'}).get('value'), 10);
			var minute = parseInt(variables.findWhere({name: 'AlarmMinute'}).get('value'), 10);
			var date = new Date();
			date.setMinutes(minute);
			date.setHours(hour);
			return date;
		}



	});


	
});