var view = require('../lib/view');
var indigo = require('indigo/lib/indigo');
var config = require('../../config/dashboard.json');


var ALARM_VARIABLES = [
	'AlarmHour',
	'AlarmMinute',
	'AlarmRunning',
	'AlarmOn'
];	




exports.start = function(params) {
	
	var app = params.app;
	
	app.get(config.DASHBOARD_URL, function(req, res) {
		//res.redirect('/dashboard.html');

		res.render('../public/server-remote-web/dashboard.html');

		// view.render(req, res, {
		// 	view: 'dashboard',
		// 	title: 'Home'
		// });
	});
	
	app.get(config.DASHBOARD_API_URL + '/:id', function(req, res) {
		console.log('GET ' + config.DASHBOARD_API_URL);
		getAlarmData(function(error, data) {
			if (error) {
				console.log('error');
			}
			data.id = '1';
			res.send(data);
		});
	});
	
	app.post(config.DASHBOARD_API_URL + '/:id', function(req, res) {
		console.log('POST ' + config.DASHBOARD_API_URL);
		setAlarmData(req.body, function(error){
			res.send(req.body);
		});
	});

	app.patch(config.DASHBOARD_API_URL + '/:id', function(req, res){
		console.log('PATCH ' + config.DASHBOARD_API_URL);
		setAlarmData(req.body, function(error){
			res.send(req.body);
		});
	});
	
}



function getNumOnDevices() {
	indigo.getDevices(function(devices){
			//console.log('devices', devices);
			var numDevices = devices.length;
			var numOnDevices = 0;
			var numDevicesRead = 0;
			devices.forEach(function(device){
				indigo.getDevice(device.name, function(device){
					//console.log(device);
					numDevicesRead += 1;
					if (device.isOn == true) {
						numOnDevices += 1;
					};
					if (numDevicesRead == numDevices) {
						console.log(numOnDevices + ' of ' + numDevices + ' devices are currently on');
					};
				})
			});
		});
}

	
	
function getAlarmData(callback) {
	var alarmData = {};
	var alarmDataFetched = 0;	
	ALARM_VARIABLES.forEach(function(alarmVariable){
		console.log('getting variable', alarmVariable);
		indigo.getVariable(
			alarmVariable,
			function(variableData){
				alarmData[alarmVariable] = variableData.value;
				alarmDataFetched += 1;
				if (alarmDataFetched >= ALARM_VARIABLES.length) {
					callback(null, alarmData);
				}
			}, 
			function(error) {
				callback(error);
			}
		);
	});
};

function setAlarmData(data, callback) {
	console.log('Set Alarm Data', data);
	
	var variablesChecked = 0;
	ALARM_VARIABLES.forEach(function(alarmVariable){
		if (data[alarmVariable] !== undefined) {
			indigo.setVariable(
				alarmVariable,
				data[alarmVariable],
				function() {
					variableChecked(null, callback);
				}, 
				function(error) {
					variableChecked(error, callback);
				}
			)
		} else {
			variableChecked(null, callback);
		}
	});
	
	function variableChecked(error, callback) {
		variablesChecked += 1;
		if (variablesChecked >= ALARM_VARIABLES.length) {
			callback();
		}
	};
	
};
	