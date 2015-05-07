var view = require('../lib/view');
var users = require('../lib/users');
var config = require('../../config/auth.json');
var log = require('../lib/log');
var cookieParser = require('cookie-parser');

var started;

var AUTH_DISABLED = true;

if (AUTH_DISABLED) {
	log.warn('Authentication Disabled');
}

exports.interceptor = function() {
	return function auth(req, res, next) {	
		//log.info(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' Request for: ' + req.url);		
		if (started) {

			// Anylize URL
			var isPublicUrl = false;
			config.PUBLIC_URLS.forEach(function(publicUrl){
				if (req.url.indexOf(publicUrl, 0) === 0) {
					isPublicUrl = true;
				};
			});

			if (req.cookies) {
				var insecureUserId = req.cookies['remote.userId'];
			}
			if (isPublicUrl || req.session.userId || (AUTH_DISABLED && insecureUserId)) {
				next();
			} else {
				//req.session.destination = req.url;
				//res.redirect(config.AUTH_LOGIN_URL);
				log.warn('Authentication Denied Request for:', req.url);
				res.status(401).send('Unauthorized');
			};	
		} else {
			next();
		};
	};
};


exports.start = function(params) {
	var app = params.app;
	
	// Serve Login Endpoint
	app.post(config.AUTH_LOGIN_API_URL, function(req, res) {
		log.info('POST ', config.AUTH_LOGIN_API_URL)
		_authenticate(req.body.username, req.body.password, function(err, user){
			if (!err && user) {
				log.info('Authentication Success');
				log.debug(user)
				var destination = req.session.destination || '/home';
				req.session.regenerate(function(){
					req.session.userId = user._id;
					req.session.cookie.expires = new Date(new Date().getTime()+5*60*1000)
					req.session.cookie.maxAge = new Date(new Date().getTime()+5*60*1000)
					//Send userId as seperate cookie for when auth is disabled.
					res.cookie('remote.userId', user._id, {
						expires: new Date(new Date().getTime()+5*60*1000)
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
	app.get(config.AUTH_LOGOUT_API_URL, function(req, res){
		log.info('GET ', config.AUTH_LOGOUT_API_URL);
		req.session.destroy(function(){
			res.send();
		});
	});

	// Current User Data Endpoint
	app.get(config.AUTH_CURRENT_USER_DATA_URL, function(req, res){
		log.info('GET ', config.AUTH_CURRENT_USER_DATA_URL);

		if (req.cookies) {
			var insecureUserId = req.cookies['remote.userId'];
		}
		if (req.session.userId || (AUTH_DISABLED && insecureUserId)) {
			var userId = req.session.userId || insecureUserId;
			console.log('uid', userId)
			users.getById(userId, function(error, user){
				if (error) {
					res.send({
						error: error
					});
				} else {
					res.send(user);
				}
			});
		} else {
			res.status(401).send('The user cannot be identified');
		}
	})

	started = true;
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


