
var users = require('../lib/users');
var config = require('../lib/config');
var log = require('../lib/log');
var cookieParser = require('cookie-parser');



exports.start = function(params) {
	var app = params.app;
	
	// Serve Login Endpoint
	app.post(config.get('AUTH_LOGIN_API_URL'), function(req, res) {
		log.info('POST ', config.get('AUTH_LOGIN_API_URL'))
		_authenticate(req.body.username, req.body.password, function(err, user){
			if (!err && user) {
				log.info('Authentication Success');
				log.debug(user)
				var destination = req.session.destination || '/home';
				req.session.regenerate(function(){
					req.session.userId = user._id;
					//Send userId as seperate cookie for when auth is disabled.
					res.cookie('remote.userId', user._id, {
						expires: new Date(new Date().getTime()+30*24*60*60*1000)
					});

					res.send(user);
				});
			} else {
				log.warn('Authentication Failed', err);
				res.send({
					error: "Authentication failed, please check your username and password."
				});
			};
		});
	});

	// Serve Logout Endpoint
	app.get(config.get('AUTH_LOGOUT_API_URL'), function(req, res){
		log.info('GET ', config.get('AUTH_LOGOUT_API_URL'));
		req.session.destroy(function(){
			res.send();
		});
	});
}



function _authenticate(username, password, callback) {
	log.info('Authenticating User:', username);
	users.getByUsername(username, function(error, user){
		if (!error && user) {
			if (user.password == password) {
				callback(null, user);
			} else {
				callback('Invalid password for ' + username);
			};
		} else {
			callback('Unable to find user: ' + username);
		}
	});
	
}


