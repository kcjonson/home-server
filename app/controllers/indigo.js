var indigo = require('../lib/indigo');
var config = require('../lib/config');
var log = require('../lib/log');
var httpProxy = require('http-proxy');





exports.start = function(params){
	var app = params.app;
	log.info('Starting Indigo REST Endpoints');




	// Listen for Events from Indigo

	app.post(config.get('INDIGO_API_URL') + '/push', function(req,res){
		var data = req.body;
		log.info('POST: ' + config.get('INDIGO_API_URL') + '/push');
		//log.debug(data);
		indigo.push(data);
		res.send();
	});
	


	// Proxy events from the great unknown to the Indigo app
	// We do this so that Indigo can still be controlled from 
	// outside the main app.  Most notibly the Indigo iOS app
	// can still connect if we lock down all ports but the main 
	// server.  This way we can log requests and optionally require
	// authentication.
	// 
	var indigoProxy = httpProxy.createProxyServer();
	app.get("/indigo*", function(req, res){
		indigoProxy.web(req, res, {target: 'http://localhost:' + config.get('INDIGO_PORT')});
	});
	app.post("/indigo*", function(req, res){
		indigoProxy.web(req, res, {target: 'http://localhost:' + config.get('INDIGO_PORT')});
	});


};


