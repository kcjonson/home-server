define([
	'jquery',
	'underscore',
	'backbone',
	'text!./Dashboard.html',
	'./actions/Action',
	'app/models/Indigo'
], function(
	$,
	_,
	Backbone,
	templateString,
	Action,
	IndigoModel
){
	


	var QUICK_ACTIONS = [
		{
			name: 'Turn Off Everything',
			label: 'Everything Off',
			condition: function(conditions) {
				return conditions.numLightsOn > 0;
			}
		},
		{
			name: 'Turn On All Lights',
			label: 'All Lights On',
			condition: function(conditions) {
				return conditions.numLightsOn !== conditions.numLights;
			}
		},
		{
			name: 'Set Movie Mood',
			label: 'Movie Mood',
			condition: function(conditions) {
				// TODO: Motion Detected in tv room recently
				return true;
			}
		},
		{
			name: 'Set Bedtime Mood',
			label: 'Bedtime Mood',
			condition: function(conditions) {
				// Todo: Motion detected in bedroom recently (need to install hardware)
				return new Date().getHours() > 17;
			}
		},
		{
			name: 'Turn On Outside Lights',
			label: 'Outside Lights On',
			condition: function(conditions) {
				return conditions.isDaylight == false && conditions.numOutsideLightsOn < conditions.numOutsideLights;
			}
		},
		{
			name: 'Turn Off Outside Lights',
			label: 'Outside Lights Off',
			condition: function(conditions) {
				return conditions.numOutsideLightsOn > 0;
			}
		}
	];
	
	

	return Backbone.View.extend({


	// Init
		name: 'Dashboard',

		initialize: function(args) {
			this.indigoModel = args.indigoModel;
			this.router = args.router;
			
			this._initializeTemplate();
			this._alarmTimeNode.addEventListener("click", _.bind(this._onAlarmTimeClick, this));
			this._alarmStatusNode.addEventListener("click", _.bind(this._onAlarmStatusClick, this));
			this._isAwayKevinNode.addEventListener("click", _.bind(this._onIsAwayKevinClick, this));
			this._isAwayMargaretNode.addEventListener("click", _.bind(this._onIsAwayMargaretClick, this));

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
		
	
	// User Event Handlers


		_onAlarmTimeClick: function() {
			this.router.navigate('alarm', {trigger: true});
		},
	
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

		_onIsAwayMargaretClick: function() {
			this._toggleAwayStatus('Margaret');
		},

		_onIsAwayKevinClick: function() {
			this._toggleAwayStatus('Kevin');
		},
		
		
		
	// Data Event Handlers

		_onIndigoModelChange: function(model) {
			//console.log('IndigoModel:change', model);
			this._updateDisplay();
		},



	// Private

		_updateDisplay: function() {
			console.log('Update Display', this.indigoModel);

			var variables = this.indigoModel.get('variables');

			// Alarm
			var hour = variables.findWhere({name: 'AlarmHour'}).get('value');
			var minute = variables.findWhere({name: 'AlarmMinute'}).get('value');
			var isOn = variables.findWhere({name: 'AlarmOn'}).get('value');
			var isRunning = variables.findWhere({name: 'AlarmRunning'}).get('value');
			if (hour && minute) {
				if (minute.toString().length < 2) {
					minute = "0" + minute;
				}
				this._alarmTimeNode.innerHTML = hour + ':' + minute;
			}	
			$(this._alarmIsOnNode).toggleClass('true', isOn);
			$(this._alarmIsOnNode).toggleClass('hidden', isRunning);
			$(this._alarmIsRunningNode).toggleClass('hidden', !isRunning);

			// Away Status
			var isAwayKevin = variables.findWhere({name: 'isAwayKevin'}).get('value');
			var isAwayMargaret = variables.findWhere({name: 'isAwayMargaret'}).get('value');
			$(this._isAwayKevinNode).toggleClass('true', !isAwayKevin);
			$(this._isAwayMargaretNode).toggleClass('true', !isAwayMargaret);

			// Devices
			// So ... this shold totally be moved to the collection.
			var devicesCollection = this.indigoModel.get('devices');
			var numLights = 0;
			var numLightsOn = 0;
			var numOutsideLights = 0;
			var numOutsideLightsOn = 0;
			var numThermostatsOn = 0;
			devicesCollection.forEach(function (deviceModel) {
				switch (deviceModel.get('category')) {
					case 'light':
						numLights += 1;
						var isOutsideLight = false;
						var deviceName = deviceModel.get('name');
						switch (deviceName) {
							case 'Outside Front Overhead Lights':
							case 'Outside Front Door Wall Sconce':
								numOutsideLights += 1;
								isOutsideLight = true;
								break;
						}
						if (deviceModel.get('brightness') > 0) {
							numLightsOn += 1;
							if (isOutsideLight) {
								numOutsideLightsOn += 1;
							}
						}
						break;
					case 'thermostat':
						if (deviceModel.get('hvacHeaterIsOn') === true) {
							numThermostatsOn += 1;
						}
						break;
				}
			}, this);
			this._numLightsOnNode.innerHTML = numLightsOn;
			if (numThermostatsOn > 0) {
				this._thermostatsStatusNode.innerHTML = 'On'
			} else {
				this._thermostatsStatusNode.innerHTML = 'Off'
			}

			this._createActions({
				numLights: numLights,
				numLightsOn: numLightsOn,
				numOutsideLights: numOutsideLights,
				numOutsideLightsOn: numOutsideLightsOn,
				isDaylight: variables.findWhere({name: 'isDaylight'}).get('value')
			});
		},

		_toggleAwayStatus: function(person) {
			var variableModel = this.indigoModel.get('variables').findWhere({name: 'isAway' + person});
			var value = variableModel.get('value');
			variableModel.on("change", _.bind(this._updateDisplay, this));
			variableModel.save({
				value: !value
			}, {patch: true});
		},

		_createActions: function(conditions) {
			//console.log('_createActions');
			var actionsCollection = this.indigoModel.get('actions');
			QUICK_ACTIONS.forEach(function(action, index){
				isVisible = action.condition(conditions)
				if (isVisible && !action.view && index < 4) {
					var actionModel = actionsCollection.findWhere({name: action.name})
					//console.log(actionsCollection, action.name, actionModel);
					if (actionModel) {
						action.view = new Action({
							model: actionModel
						}).placeAt(this._actionsNode);
					}
				} else if (action.view && !isVisible) {
					action.view.remove();
					action.view = undefined;
				}
			}, this);
		}

	});


	
});