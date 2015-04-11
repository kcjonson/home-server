var indigo = require('indigo/lib/indigo');
var mongoose = require('mongoose');
var config = require('../../config/users.json');
var appConfig = require('../../config/app.json');
var users = require('../lib/users');
var checkins = require('../lib/checkins');
var log = require('../lib/log');



var CONNECTION;													// DB Connection Handle
var LOCATION_HOME = exports.LOCATION_HOME = 'Home';				
var LOCATION_UNKNOWN = exports.LOCATION_UNKNOWN = 'Unknown';
	
	


// Endpoints

exports.start = function(params){
	var app = params.app;
	log.info('Attaching Users API Endpoints');
	app.get(config.USERS_API_URL, function(req, res) {
		log.info('GET ' + config.USERS_API_URL);
		users.getAll(function(error, users){
			if (error) {res.send(error)} else {
				res.send(users);
			}
		});
	})
};







