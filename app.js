

// Node Modules
var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var httpProxy = require('http-proxy');
var mongoose = require('mongoose');
var path = require('path');

// Express Middleware
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var auth = require('./app/middleware/auth');
var request = require('./app/middleware/request');

// Lib
var config = require('./app/lib/config');
var log = require('./app/lib/log');
var database = require('./app/lib/database');
var services = require('./app/services');

// var devicesLib = require('./app/lib/devices');
// var triggersLib = require('./app/lib/triggers');


var app;  // Ref to express application instance



log.info('Beginning server startup')

connectDatabase()
	.then(configureExpress)
	.then(attachServices)
	.then(createServer)
	.catch(function(e) {
		log.error(e);
		process.exit();
	});


	// TODO: Shouldn't the device eventing be started
	// before the endpoints are set up?
	// NOTE: Should we do this manually?  Why not just
	// have it done at require time?
	// devicesLib.start();
	// triggersLib.start();






function connectDatabase() {
	log.debug('')
	return new Promise(function(resolve, reject){
		database.getConnection(function(err, connection){
			if (err) {
				log.error('Startup failed: Unable to connect to database.');
				process.exit();
			}
			resolve();
		})
	})
}


function configureExpress() {
	log.debug('')

	// Engine and views setup
	app = express();

	// Cookie and Session Setup
	app.use(cookieParser(config.get('AUTH_COOKIE_SECRET')));
	app.use(session({
		secret: config.get('AUTH_SESSION_SECRET'),
		resave: false,
	    saveUninitialized: true,
	    rolling: true,
	    store: new MongoStore({ mongooseConnection: mongoose.connection }),
		cookie: {
			httpOnly: false,
			expires: new Date(new Date().getTime()+30*24*60*60*1000)
		}
	}));

	// Auth and Static Setup
	app.use(auth);
	app.use(request);
	//app.use(express.logger('dev'));

	if (config.get('DASHBOARD_ENABLED')) {
		var publicDirectory = path.resolve(__dirname, config.get('SERVER_PUBLIC_DIRECTORY'));
		log.info('Mapping public directory: ', publicDirectory);
		app.use(express.static(publicDirectory));
	}

	// bodyParser must go ofter proxy settings because it interrupts the 
	// post stream.
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
	  extended: true
	}));

};


function attachServices() {
	services.attach({app: app});

}

function createServer() {

	if (config.get('SERVER_SSL_ENABLED')) {
		// Secure Server
		https.createServer({
			key: fs.readFileSync(config.get('SERVER_SSL_PRIVATE_KEY')),
			cert: fs.readFileSync(config.get('SERVER_SSL_CERT'))
		}, app).listen(config.get('SERVER_SECURE_PORT'));
		log.info('Secure Server started on port ' + config.get('SERVER_SECURE_PORT'));
	}

	// Unsecure Server
	http.createServer(app).listen(config.get('SERVER_PORT'));
	log.info('Server started on port ' + config.get('SERVER_PORT'));


	
}
















