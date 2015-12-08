var log = require('../lib/log');
var database = require('./database');
var AlarmModel = require('../models/alarm');
var devices = require('./Devices');




var START_DATE;
var END_DATE;
var ALARM_INTERVAL;
var ALARMS = [];  // Store copy of alarms to reduce queries
var IS_ON = false;
var RUNNING = false;
var CHECK_INTERVAL = 60 * 1000; // Every Minute.
var ALARM_FADE_LENGTH = 30 * 60 * 1000; // 30 Minutes
var MUSIC_START_DELAY = 5 * 60 * 1000; // 5 Minutes
var MUSIC_MAX_VOLUME = 40; // Percentage of volume.
var LIGHT_ID = '554d3dce743ed3ca3e4742b8';  // TODO: Move to DB


// Public API

exports.get = _get;
exports.set = _set;
exports.start = _start;




// Startup

function _start() {

	_loadAlarms(function(){

		// Delay the start until the minute.
		var startDelay = CHECK_INTERVAL - new Date() % CHECK_INTERVAL;
		setTimeout(function(){
			setInterval(function(){


				var now = new Date();
				var nowTime = now.getTime();  // Awwww yeeaaaahhh, its NOW time.
				var startTime = START_DATE.getTime();
				var endTime = END_DATE.getTime();
				var lightPercentage;
				var musicPercentage;

				// Determine which alarm should be running (if any) and take action.
	 			ALARMS.forEach(function(alarm){

	 				// Compute Dates
	 				var now = new Date();
	 				var nowTime = now.getTime();
	 				var startDate = new Date(now.getTime());
	 				startDate.setMinutes(alarm.minute);
					startDate.setHours(alarm.hour);
	 				var startTime = startDate.getTime();
					var endDate = new Date(startDate.getTime() + ALARM_FADE_LENGTH);
					var endTime = endDate.getTime();

					// Start Alarm if Applicable
					// This should only run on the minute
	 				if (now.getHours() == alarm.hour && now.getMinutes() == alarm.minute && alarm.isOn) {
	 					log.info('Alarm Starting')
	 					alarm.running = true;
	 					database.findOne(AlarmModel, {'_id': alarm._id}, function(e, doc){
							doc.set({running: true});
							doc.save();
						});
	 				};

	 				// End Alarm if Applicable
					if ((nowTime > endTime && alarm.running) || (!alarm.isOn && alarm.running)) {
						log.info('Alarm Ending')
						alarm.running = false;
						database.findOne(AlarmModel, {'_id': alarm._id}, function(e, doc){
							doc.set({running: false});
							doc.save()
						});
					};

					if (alarm.running) {
						log.info('Alarm Running');

						if (nowTime >= startTime && nowTime <= endTime) {
							console.log('Within Alarm Range')
							lightPercentage = Math.round(((nowTime - startTime) / ALARM_FADE_LENGTH) * 100);
						}

						if (nowTime >= (startTime + MUSIC_START_DELAY) && nowTime <= endTime) {
							musicPercentage = Math.round(((nowTime - (startTime + MUSIC_START_DELAY)) / (ALARM_FADE_LENGTH - MUSIC_START_DELAY)) * 100);
						}

						if (lightPercentage) {
							console.log('Setting Light Percantage', lightPercentage);
							devices.set(LIGHT_ID, {'brightness': lightPercentage}, function(e, data){
								if (e) {log.error(e)}
							});
						};

						if (musicPercentage) {
							console.log('Setting Music Percantage', musicPercentage);
							
							// TODO: Move to DB, don't leave hard coded!
							// 554d3dce743ed3ca3e4742ae
						}


					}
	 			});

			}, CHECK_INTERVAL);
		}, startDelay);

	});

}




function _get(id, callback) {
	if (typeof id === 'function') {
		callback = id;
	};
	callback(null, ALARMS);
};

function _set(id, data, callback) {
	if (typeof id === 'object') {
		callback = data;
		data = id;
		id = undefined;
	}
	if (id) {
		database.findOne(AlarmModel, {'_id': id}, function(e, doc){
			doc.set(data);
			doc.set({running: false});
			doc.save(function(e, doc){
				_setLocalAlarm(doc);
				callback(e, doc);
			})
		});
	} else {
		log.error('Setting of mutliple alarms not supported')
		callback('Setting of mutliple alarms not supported');
	}
	
};

function _loadAlarms(callback) {
	database.getAll(AlarmModel, function(e, docs){
		if (docs.forEach && docs.length > 0) {
			// Just use the first one
			_setLocalAlarm(docs[0]);
			callback();
		}
	});
};


function _setLocalAlarm(alarm) {
	//log.debug(alarm);

	// Copy the useful stuff
	var oldStartDate = START_DATE || new Date();
	START_DATE = new Date();
	START_DATE.setMinutes(alarm.minute || oldStartDate.getMinutes());
	START_DATE.setHours(alarm.hour || oldStartDate.getHours());
	END_DATE = new Date(START_DATE.getTime() + ALARM_FADE_LENGTH);
	IS_ON = alarm.isOn;
	RUNNING = alarm.running;

	var alarmIndex;
	ALARMS.forEach(function(a, index){
		if (alarm._id.toString() == a._id.toString()) {
			alarmIndex = index;
		}
	});

	if (alarmIndex == undefined) {
		ALARMS.push(alarm);
	} else {
		ALARMS[alarmIndex] = alarm;
	}

}

