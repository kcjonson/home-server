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

// Lib (Utilities);
var users = require('./app/lib/users');
var log = require('./app/lib/log');

var geohopper = require('./app/lib/geohopper');
// TODO Auth Lib

// Node Modules
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var https = require('https');
var http = require('http');
var fs = require('fs');
var hbs = require('hbs');
var httpProxy = require('http-proxy');




// Express App Setup
var app = express();
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
app.set('views', __dirname + '/app/views');
app.use(cookieParser(authConfig.AUTH_COOKIE_SECRET));
app.use(session({
	secret: authConfig.AUTH_SESSION_SECRET,
	cookie: {
		httpOnly: false,
		maxAge: 2629743 // Approx one month
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
app.use(bodyParser());




// Start Auth
authController.start({
	app: app
});

// Start Foursquare Service
foursquareController.start({
	app: app
});

// Start Geohopper Service
geohopperController.start({
	app: app
});

//Set up Indigo REST Endpoints
indigoController.start({
	app: app
});

// Start Dashboard 
dashboardController.start({
	app: app
});

// Start Users REST Endpoints
usersController.start({
	app: app
});





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






