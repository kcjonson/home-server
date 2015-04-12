var view = require('../lib/view');
var users = require('../lib/users');
var config = require('../../config/auth.json');
var log = require('../lib/log');

var started;

var AUTH_DISABLED = true;

if (AUTH_DISABLED) {
	log.warn('Authentication Disabled');
}

exports.interceptor = function() {
	return function auth(req, res, next) {	
		//log.info(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' Request for: ' + req.url);		
		if (started) {		
			var isPublicUrl = false;
			config.PUBLIC_URLS.forEach(function(publicUrl){
				if (req.url.indexOf(publicUrl, 0) === 0) {
					isPublicUrl = true;
				};
			});			
			if (isPublicUrl || req.session.userId || AUTH_DISABLED) {
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
	publicUrls = params.publicUrls;
	
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

	app.get(config.AUTH_CURRENT_USER_DATA_URL, function(req, res){
		log.info('GET ', config.AUTH_CURRENT_USER_DATA_URL);
		if (req.session.userId) {
			users.getById(req.session.userId, function(error, user){
				if (error) {
					res.send({
						error: error
					});
				} else {
					res.send(user);
				}
			});
		} else {
			res.status(401).send('There is no user logged in');
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


