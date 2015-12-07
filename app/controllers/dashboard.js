var config = require('../lib/config');
var appRoot = require('app-root-path');
var path = require('path');



exports.start = function(params) {
	var app = params.app;
	var url = config.get('DASHBOARD_URL');

	// Server all content to this route to the single static file
	// On the client Backbone.Router handles the redirection to 
	// the proper view, so we only serve the base html.
	var view = path.join(appRoot.toString(), config.get('SERVER_PUBLIC_DIRECTORY'), '/app.html')
	app.get(url + '*', function(req, res) {
		res.sendFile(view);
	});
}


	