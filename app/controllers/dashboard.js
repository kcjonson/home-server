var config = require('../../config/dashboard.json');
var log = require('../lib/log');



exports.start = function(params) {
	
	var app = params.app;
	
	app.get(config.DASHBOARD_URL + '*', function(req, res) {
		//res.redirect('/dashboard.html');

		res.render('../public/server-remote-web/dashboard.html');

		// view.render(req, res, {
		// 	view: 'dashboard',
		// 	title: 'Home'
		// });
	});

	
}


	