var indigo = require('indigo/lib/indigo');
var mongoose = require('mongoose');
var config = require('../../config/users.json');
var appConfig = require('../../config/app.json');
var users = require('../lib/users');
var checkins = require('../lib/checkins');



var CONNECTION;													// DB Connection Handle
var LOCATION_HOME = exports.LOCATION_HOME = 'Home';				
var LOCATION_UNKNOWN = exports.LOCATION_UNKNOWN = 'Unknown';
	
	


// Endpoints

exports.start = function(params){
	var app = params.app;
	console.log('Attaching Users API Endpoints');
	app.get(config.USERS_API_URL, function(req, res) {
		console.log('GET ' + config.USERS_API_URL);
		users.getAll(function(error, users){
			console.log('u', users)
			if (error) {res.send(error)} else {
				res.send(users);
			}
		});
	})
};







