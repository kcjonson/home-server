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

	// All users
	app.get(config.USERS_API_URL, function(req, res) {
		log.info('GET ' + config.USERS_API_URL);
		users.getAll(function(error, users){
			if (error) {res.send(error)} else {
				res.send(users);
			}
		});
	});

	// User by ID
	app.get(config.USERS_API_URL + '/:id', function(req, res){
		log.info('GET ' + config.USERS_API_URL + '/:id/');
		var id = req.params.id;
		res.send('TODO')
	});

	// Checkins
	app.get(config.USERS_API_URL + '/:id/checkins', function(req, res){
		log.info('GET ' + config.USERS_API_URL + '/:id/checkins');
		var id = req.params.id;
		checkins.getByUserId(id, function(error, data){
			if (error) {
				res.send('An error occured')
			} else {
				log.debug(data);
				res.send(data)
			}
		});
		

	});

	
};







