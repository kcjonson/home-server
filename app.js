// Config
var authConfig = require('./config/auth.json');
var appConfig = require('./config/app.json');
var indigoConfig = require('./config/indigo.json')

// Controllers (Handle Endpoints)
var usersController = require('./app/controllers/users');
var authController = require('./app/controllers/auth');
var indigoController = require('./app/controllers/indigo');
var dashboardController = require('./app/controllers/dashboard');
var foursquareController = require('./app/controllers/foursquare');
var geohopperController = require('./app/controllers/geohopper');
var alarmsController = require('./app/controllers/alarms');
var devicesController = require('./app/controllers/devices');
var nestController = require('./app/controllers/nest');
var actionsController = require('./app/controllers/actions');
var settingsController = require('./app/controllers/settings');
var weatherController = require('./app/controllers/weather'); 

// Lib (Utilities);
var log = require('./app/lib/log');
var database = require('./app/lib/database');
var devicesLib = require('./app/lib/devices');
var triggersLib = require('./app/lib/triggers');

// Node Modules
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var https = require('https');
var http = require('http');
var fs = require('fs');
var hbs = require('hbs');
var httpProxy = require('http-proxy');
var mongoose = require('mongoose');

// Vars
var app;




database.getConnection(function(){
	configureExpress();
	attachControllers();
	startServer();
	devicesLib.start();
	triggersLib.start();
})


function configureExpress(mongooseConnection) {
	// Express App Setup
	app = express();
	app.set('view engine', 'html');
	app.engine('html', require('hbs').__express);
	app.set('views', __dirname + '/app/views');

	app.use(cookieParser(authConfig.AUTH_COOKIE_SECRET));
	app.use(session({
		secret: authConfig.AUTH_SESSION_SECRET,
		resave: false,
	    saveUninitialized: true,
	    rolling: true,
	    store: new MongoStore({ mongooseConnection: mongoose.connection }),
		cookie: {
			httpOnly: false,
			expires: new Date(new Date().getTime()+30*24*60*60*1000)
		}
	}));
	app.use(authController.interceptor());
	//app.use(express.logger('dev'));
	app.use(express.static(__dirname + '/app/public/'));

	// Start Indigo Proxy
	var indigoProxy = httpProxy.createProxyServer();
	app.get("/indigo*", function(req, res){
		indigoProxy.web(req, res, {target: 'http://localhost:' + indigoConfig.INDIGO_PORT});
	});
	app.post("/indigo*", function(req, res){
		indigoProxy.web(req, res, {target: 'http://localhost:' + indigoConfig.INDIGO_PORT});
	});

	// bodyParser must go ofter proxy settings because it interrupts the 
	// post stream.
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
	  extended: true
	}));


};

function attachControllers() {
	// Start Endpoints
	//
	// This is a bit of a half assed way to manage routes. 
	// Each "controller" starts their own URL mappings and
	// begins listening.
	authController.start({app: app});
	foursquareController.start({app: app});
	geohopperController.start({app: app});
	indigoController.start({app: app});
	dashboardController.start({app: app});
	usersController.start({app: app});
	alarmsController.start({app: app});
	devicesController.start({app: app});
	nestController.start({app: app});
	actionsController.start({app: app});
	settingsController.start({app: app});
	weatherController.start({app: app});
}

function startServer() {
	// Actually Start the Web Server
	// Where we say "start" above is a bold faced lie.

	// Unsecure Server
	http.createServer(app).listen(appConfig.SERVER_PORT);
	log.info('Starting server on port ' + appConfig.SERVER_PORT);

	// Secure Server
	var privateKey = fs.readFileSync(appConfig.SSL_PRIVATE_KEY);
	var certificate = fs.readFileSync(appConfig.SSL_CERT);
	if (privateKey && certificate) {
		https.createServer({
			key: privateKey,
			cert: certificate
		}, app).listen(appConfig.SERVER_SECURE_PORT);
		log.info('Starting secure server on port ' + appConfig.SERVER_SECURE_PORT);
	} else {
		log.info('Unable to start secure server: private key and certificate not found');
	}

}
















