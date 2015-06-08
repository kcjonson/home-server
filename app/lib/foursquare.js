var https = require('https');
var users = require('./users');
var checkins = require('./checkins');
var config = require('../../config/foursquare.json');



// Public API
	exports.checkin = _checkin;
	exports.authenticateUser = _authenticateUser;





// Private

function _checkin(data) {
	console.log('Foursquare Service: checkin');
	if (data && data.user && data.user.id) {
		users.getByFoursquareId(data.user.id, function(error, user){
			if (user) {
				console.log('Foursquare user found, pushing new location');
				checkins.add({
					user: user._id,
					name: data.venue.name,
					date: data.createdAt * 1000,   /// WHAT THE FUCK?
					coordinates: [
						data.venue.location.lng,
						data.venue.location.lat
					],
					source: 'FOURSQUARE',
					action: 'ENTER'
				});
			} else {
				console.log('ERROR: Foursquare user ', data.user.id, ' not found');
			}
		});
	} else {
		console.log('ERROR: Cannot handle checkin, data malformed');
	}
};



function _authenticateUser(code) {
	console.log('handleAuthenticateRequest', code);

	var requestPath = '/oauth2/access_token';
    requestPath += '?client_id=' + config.FOURSQUARE_CLIENT_ID;
    requestPath += '&client_secret=' + config.FOURSQUARE_CLIENT_SECRET;
    requestPath += '&grant_type=authorization_code';
    requestPath += '&redirect_uri=https://1825eglen.com' + config.SERVICE_AUTHENTICATE_SUCCESS_URL;
    requestPath += '&code=' + code;

	var requestOptions = {
		hostname: 'foursquare.com',
		path: requestPath
	};

	var responseBody = '';
	var req = https.get(requestOptions, function(res) {
		console.log('authenticate request');
		res.on('data', function(chunk) {
			responseBody += chunk;
		});
		res.on('end', function(){
			handleAuthenticateRequest(responseBody);
		});
	}).on('error', function(e) {
		console.log('problem with request: ' + e.message);
	})
}

function handleAuthenticateRequest(body) {
	console.log('resp', body);
}



