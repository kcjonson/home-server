var log = require('../lib/log');
var http = require('http');

var endpoints;

exports.registerEndpoint = function(endpoint) {
	if (!endpoints) {endpoints =[]}
	endpoints.push(endpoint);
};

exports.start = function(params) {
	log.info('Starting Collector Endpoint');
	if (!endpoints) {endpoints =[]}	
	var app = params.app;

	app.get('/api', function(req, res) {
		log.info('GET /api');

		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		});

		endpoints.forEach(function(endpoint){
			http.get({
				path: endpoint
			}, function(dataRes){
				var str = '';
				dataRes.on('data', function (chunk) {
				  str += chunk;
				});
				dataRes.on('end', function () {
					res.write('event: modeldata\n')
					res.write('data: ' + JSON.stringify({
						endpoint: endpoint.substr(1), // Backend URLS have leading slashes (front end does not)
						payload: JSON.parse(str)
					}) + '\n\n')

				});

				// TODO: Listen for changes
			})
		});
	});

};


	