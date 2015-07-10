var config = require('../../config/geohopper.json');
var users = require('./users');
var checkins = require('./checkins');
var log = require('./log');
var settings = require('./settings');


var STARTED = false;

exports.checkin = _checkin


function _checkin(data) {
	log.debug(data);

	if (data.location == config.GEOHOPPER_HOME_NAME) {

		users.getByGeohopperName(data.sender, function(error, user){
			if (user) {
				//console.log(user.username, data.location, data.event, data.time);
				var action;
				switch (data.event) {
					case 'LocationEnter':
						action = 'ENTER';
						break;
					case 'LocationExit':
						action = 'EXIT';
						break;
					default:
						// Everyone panic.
				};
				settings.get(function(err, settingsData){
					log.debug(err, settingsData);
					checkins.add({
						user: user._id,
						name: config.GEOHOPPER_HOME_NAME, 
						date: data.time,
						action: action,
						coordinates: settingsData.coordinates,
						source: 'GEOHOPPER'
					});
				});
			} else {
				log.error('Unrecognized Geohopper User', error);
			}
		});

	}
};




