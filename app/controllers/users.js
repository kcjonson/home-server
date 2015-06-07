var indigo = require('indigo/lib/indigo');
var mongoose = require('mongoose');
var config = require('../../config/users.json');
var appConfig = require('../../config/app.json');
var users = require('../lib/users');
var checkins = require('../lib/checkins');
var log = require('../lib/log');
var collector = require('./collector');



var CONNECTION;													// DB Connection Handle
var LOCATION_HOME = exports.LOCATION_HOME = 'Home';				
var LOCATION_UNKNOWN = exports.LOCATION_UNKNOWN = 'Unknown';
	
	


// Endpoints

exports.start = function(params){
	var app = params.app;
	log.info('Attaching Users API Endpoints');

	// All users
	collector.registerEndpoint(config.USERS_API_URL);
	app.get(config.USERS_API_URL, function(req, res) {
		log.info('GET ' + config.USERS_API_URL);
		users.get(function(error, users){
			if (error) {res.send(error)} else {
				res.send(users);
			}
		});
	});

	// User by ID
	app.get(config.USERS_API_URL + '/:id', function(req, res){
		log.info('GET ' + config.USERS_API_URL + '/:id/');
		var id = req.params.id;
		if (id === 'current') {
			if (req.session.userId) {
				users.getById(req.session.userId, function(error, user){
					if (error) {
						res.send({
							error: "An error occured while trying to fetch the current user data"
						});
					} else {
						res.send(user);
					}
				});
			} else {
				log.warn('The current user cannot be identified');
				res.status(401).send({
					error: 'The current user cannot be dentified'
				});
			}
		} else {
			res.send({
				error: 'User fetching endpoint is not finished!'	
			})
		}
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







