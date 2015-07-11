var log = require('../lib/log');
var http = require('http');
var EventSource = require('eventsource');

var endpoints;
if (!endpoints) {endpoints =[]}

exports.registerEndpoint = function(endpoint) {
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

		var eventSourceRefs = {};
		endpoints.forEach(function(endpoint){
			http.get({
				path: endpoint
			}, function(dataRes){
				var str = '';
				dataRes.on('data', function (chunk) {
				  str += chunk;
				});
				dataRes.on('end', function () {

					// The first payload will be "modeldata" which contains
					// the whole object for the model.
					res.write('event: modeldata\n')
					res.write('data: ' + JSON.stringify({
						endpoint: endpoint.substr(1), // Backend URLS have leading slashes (front end does not)
						payload: JSON.parse(str)
					}) + '\n\n')

					// Now that the initial load is done, lets listen for pushes
					// Were going to route the data that we get from the endpoints
					// through the same connection and trust that the browser will
					// do the right thing.
					eventSourceRefs[endpoint] = new EventSource(endpoint + '/push');

					req.connection.addListener('close', function() {
						_closeEventSource(eventSourceRefs, endpoint);
					})

					eventSourceRefs[endpoint].onmessage = function(e) {
						res.write('event: modelpush\n')
						res.write('data: ' + JSON.stringify({
							endpoint: endpoint.substr(1), // Backend URLS have leading slashes (front end does not)
							payload: JSON.parse(e.data)
						}) + '\n\n')
					};
					eventSourceRefs[endpoint].onerror = function(err) {
						// This will fire if the endpoint is not mapped of if there
						// is malformed payload
						log.error('error', endpoint, err);
						_closeEventSource(eventSourceRefs, endpoint);
					};
				});


			})
		});
	});
};


function _closeEventSource(refs, endpoint) {
	if (refs[endpoint]) {
		if (refs[endpoint].close) {
			refs[endpoint].close();
		}
		delete refs[endpoint];
	}
}
