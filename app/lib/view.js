var fs = require('fs');
var users = require('./users');

exports.render = function(req, res, params) {
	_checkForStylesheet(req, res, params);
};


function _checkForStylesheet(req, res, params) {
	// Check for CSS of same name
	var path = 'app/public/styles/' + params.view + '.less';
	fs.exists(path, function(exists) {
		if (exists) {
			params.stylesheet = 'styles/' + params.view + '.less';
		}
		_checkForAppController(req, res, params);
	});
};

// Is there a RequireJS/Backbone App for this view?
function _checkForAppController(req, res, params) {
	var path = 'app/public/scripts/apps/' + params.view + '/app.js';
	fs.exists(path, function(exists) {
		if (exists) {
			params.app = 'scripts/apps/' + params.view + '/app';
		}
		_getUserDisplayName(req, res, params);
	});	
};

function _getUserDisplayName(req, res, params) {
	var userId = req.session.userId;
	if (userId) {
		users.getById(userId, function(error, user){
			if (user) {
				params.userDisplayName = user.name.first;
			}
			_render(req, res, params);
		});
	} else {
		_render(req, res, params);
	}
};

function _render(req, res, params) {
	// Set up locals
	res.locals = params.locals || {};
	res.locals.userName = req.session.userame;
	if (params.userDisplayName) {res.locals.userDisplayName = params.userDisplayName};
	if (params.stylesheet) {res.locals.stylesheet = params.stylesheet};
	if (params.app) {res.locals.app = params.app};
	res.locals.view = params.view;
	
	// Render view
	res.render(params.view, {
		title: params.title,
		layout: '../templates/base'
	});
} 