var view = require('../lib/view');
var users = require('../lib/users');
var config = require('../../config/auth.json');

var started;


exports.interceptor = function() {
	return function auth(req, res, next) {	
		console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' Request for: ' + req.url);		
		if (started) {		
			var isPublicUrl = false;
			config.PUBLIC_URLS.forEach(function(publicUrl){
				if (req.url.indexOf(publicUrl, 0) === 0) {
					isPublicUrl = true;
				};
			});			
			if (isPublicUrl || req.session.userId) {
				next();
			} else {
				req.session.destination = req.url;
				res.redirect(config.AUTH_LOGIN_URL);
			};	
		} else {
			next();
		};
	};
};


exports.start = function(params) {

	var app = params.app;
	publicUrls = params.publicUrls;
	
	// Server Login Page
	app.get(config.AUTH_LOGIN_URL, function(req, res) {
		view.render(req, res, {
	    	view: 'login',
	    	title: 'Login',
	    	locals: {
	    		error: req.session.error,
	    		success: req.session.success
	    	}
	    });
	});
	
	// Serve Login Endpoint
	app.post(config.AUTH_LOGIN_URL, function(req, res) {
		_authenticate(req.body.username, req.body.password, function(err, user){
			if (user) {
				console.log('Authentication Success');
				var destination = req.session.destination || '/home';
				req.session.regenerate(function(){
					console.log('u', user) 
					req.session.userId = user._id;
					req.session.success = 'Authenticated as ' + user.username;
					req.session.destination = null;
					res.redirect(destination);
				});
			} else {
				console.log('Authentication Failed', err);
				req.session.error = 'Authentication failed, please check your username and password.';
				res.redirect(config.AUTH_LOGIN_URL);
			};
		});
	});
	
	// Serve Logout Page
	app.get(config.AUTH_LOGOUT_URL, function(req, res){
		// destroy the user's session to log them out
		// will be re-created next request
		req.session.destroy(function(){
			res.redirect(config.AUTH_LOGIN_URL);
		});
	});

	started = true;
}


function _authenticate(username, password, callback) {
	console.log('Authenticate', username, password);
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


