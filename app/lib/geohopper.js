var config = require('../../config/geohopper.json');
var users = require('./users');
var checkins = require('./checkins');
var log = require('./log');

var STARTED = false;

exports.checkin = _checkin


function _checkin(data) {
	log.debug(data);
	users.getByGeohopperName(data.sender, function(error, user){
		if (user) {
			//console.log(user.username, data.location, data.event, data.time);
			log.debug(user);
			var location;
			switch (data.event) {
				case 'LocationEnter':
					location = data.location == config.GEOHOPPER_HOME_NAME ? config.GEOHOPPER_HOME_NAME : data.location
					// TODO: Add lat,lng when known
					break;
				case 'LocationExit':
					// ?? 
					break;
				default:
					// Everyone panic.
			};
			log.debug('location: ', location);
			checkins.add({
				user: user._id,
				name: location,  // May be null
				date: data.time
			});

		} else {
			log.error('Unrecognized Geohopper User', error);
		}
	});
};




