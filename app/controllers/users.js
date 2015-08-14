var indigo = require('indigo/lib/indigo');
var config = require('../lib/config');
var users = require('../lib/users');
var checkins = require('../lib/checkins');
var log = require('../lib/log');
var collector = require('./collector');




// Endpoints

exports.start = function(params){
	var app = params.app;
	log.info('Attaching Users API Endpoints');




	// All users
	collector.registerEndpoint(config.get('USERS_API_URL'));
	app.get(config.get('USERS_API_URL'), function(req, res) {
		log.info('GET ' + config.get('USERS_API_URL'));
		users.get(function(error, users){
			if (error) {res.send(error)} else {
				res.send(users);
			}
		});
	});

	// Push Stream
	app.get(config.get('USERS_API_URL') + '/push', function(req, res) {
		log.info('GET ' + config.get('USERS_API_URL') + '/push');
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		});
		var writeData = function(event){
			console.log('writeData', event.data);
			res.write("data: " + JSON.stringify(event.data) + "\n\n");
		};
		users.events.on('change', writeData);
		req.on("close", function() {
			users.events.removeListener('change', writeData);
		});
	});

	// User by ID
	app.get(config.get('USERS_API_URL') + '/:id', function(req, res){
		log.info('GET ' + config.get('USERS_API_URL') + '/:id/');
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

				// We check to see if there are actually
				// any users in the DB and if not, send the user to the
				// create account workflow on the client
				users.get(function(err, users){
					if (users.length > 0) {
						log.warn('The current user cannot be identified');
						res.status(401).send({
							error: 'The current user cannot be dentified',
							users: true
						});
					} else {			
						res.send({
							error: log.warn('There are no users in the database'),
							users: false
						});
					}
				})
			};
		} else {
			res.send({
				error: 'User fetching endpoint is not finished!'	
			});
		};
	});


	app.post(config.get('USERS_API_URL') + '/:id', _post);
	app.post(config.get('USERS_API_URL'), _post);


	// Checkins
	app.get(config.get('USERS_API_URL') + '/:id/checkins', function(req, res){
		log.info('GET ' + config.get('USERS_API_URL') + '/:id/checkins');
		var id = req.params.id;
		checkins.getByUserId(id, function(error, data){
			if (error) {
				res.send('An error occured')
			} else {
				res.send(data)
			}
		});
	});

	app.post(config.get('USERS_API_URL') + '/:id/checkins', function(req, res){
		var id = req.params.id;
		log.info('POST: ' + config.get('USERS_API_URL') + '/:id/checkins');
		var data = req.body;
		if (data) {
			checkins.add({
				source: 'REMOTE',
				user: id,
				date: data.timestamp,
				coordinates: [
					data.coords.longitude,
					data.coords.latitude
				],
				action: 'ENTER'
			});
		}
		res.end();
	});
};


function _post(req, res){
	if (req.params.id) {
		log.info('POST: ' + config.get('USERS_API_URL') + '/:id');
	} else {
		log.info('POST: ' + config.get('USERS_API_URL'));
	}
	var data = req.body;
	if (data._id || req.params.id) {
		data._id = data._id || req.params.id;
	}
	if (data) {
		users.set(req.body, function(err, user){
			if (err) {
				res.send({
					error: "An error occured while trying to set user"
				});
			} else {
				res.send(user);
			}
		});
	} else {
		res.send({
			error: "No user data to set provided"
		});
	}
	
}

