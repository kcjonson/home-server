var log = require('../lib/log');
var config = require('../lib/config');
var http = require('http');
var EventSource = require('eventsource');

var endpoints;
if (!endpoints) {endpoints =[]}

exports.registerEndpoint = function registerEndpoint(endpoint) {
	log.debug(endpoint)
	endpoints.push(endpoint);
};

// NOTE: EventSource events do not carry a status as part of 
// their API.  We're going to add a status to the payload 
// so that the front end can handle things more gracefully.

// NOTE: Backend URLS have leading slashes (front end does not)
// which is why we have .substr(1) on the endpoint payload

exports.start = function start(params) {
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
		var server = 'http://127.0.0.1' 
		endpoints.forEach(function getEndpoint(endpoint){
			http.get(server + endpoint, function(dataRes){
				if (dataRes.statusCode === 200) {
					var str = '';
					dataRes.on('data', function (chunk) {
					  str += chunk;
					});
					dataRes.on('end', function () {

						var payload, err;
						try {
							payload = JSON.parse(str);
							err = payload.error;
						} catch(e) {
							err = log.error('Error handling response in collector: Payload parsing failed');
						}

						if (err) {
							// The endpoint returned an error
							res.write('event: modeldata\n')
							res.write('data: ' + JSON.stringify({
								endpoint: endpoint.substr(1), 
								error: err,
								status: 200
							}) + '\n\n')
						} else {
							// The first payload will be "modeldata" which contains
							// the whole object for the model.
							res.write('event: modeldata\n')
							res.write('data: ' + JSON.stringify({
								endpoint: endpoint.substr(1), 
								payload: JSON.parse(str),
								status: 200
							}) + '\n\n')

							// Now that the initial load is done, lets listen for pushes
							// Were going to route the data that we get from the endpoints
							// through the same connection and trust that the browser will
							// do the right thing.
							eventSourceRefs[endpoint] = new EventSource(server + endpoint + '/push');

							req.connection.addListener('close', function() {
								_closeEventSource(eventSourceRefs, endpoint);
							})

							eventSourceRefs[endpoint].onmessage = function(e) {
								res.write('event: modelpush\n')
								res.write('data: ' + JSON.stringify({
									endpoint: endpoint.substr(1), // Backend URLS have leading slashes (front end does not)
									payload: JSON.parse(e.data),
									status: 200
								}) + '\n\n')
							};
							eventSourceRefs[endpoint].onerror = function(err) {
								// This will fire if the endpoint is not mapped of if there
								// is malformed payload
								log.error(endpoint, err);
								res.write('event: modelpush\n');
								res.write('data: ' + JSON.stringify({
									endpoint: endpoint.substr(1), 
									status: 500
								}) + '\n\n')
								_closeEventSource(eventSourceRefs, endpoint);
							};
						} 
					});
				} else {
					log.error(dataRes.statusCode, dataRes.statusMessage);
					res.write('event: modeldata\n')
					res.write('data: ' + JSON.stringify({
						endpoint: endpoint.substr(1), 
						status: dataRes.statusCode
					}) + '\n\n')
				}
			}).on('error', function(e) {
				console.log("Got error: " + e.message);
			});
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
