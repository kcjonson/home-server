var config = require('../../config/geohopper.json');
var users = require('./users');
var checkins = require('./checkins');

var STARTED = false;

exports.checkin = _checkin


function _checkin(data) {
	console.log('Geohopper Checkin')
	users.getByGeohopperName(data.sender, function(error, user){
		if (user) {
			console.log(user.username, data.location, data.event, data.time);
			var location;
			switch (data.event) {
				case 'LocationEnter':
					location = data.location;
					// TODO: Add lat,lng when known
					break;
				case 'LocationExit':
					// ?? 
					break;
				default:
					// Everyone panic.
			};

			checkins.add({
				user: user._id,
				name: location,  // May be null
				date: data.time
			});

		} else {
			console.log('Unrecognized Geohopper User', error);
		}
	});
};




