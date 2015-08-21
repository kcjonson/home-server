var log = require('../lib/log');
var config = require('../lib/config');
var authorized = require('../util/authorized');

module.exports = function auth(req, res, next) {
	if (req.ip == '::ffff:127.0.0.1') {
		next();
	} else {

		var authDisabled = config.get('AUTH_DISABLED');

		// Anylize URL
		var isPublicUrl = false;
		var publicUrls = config.get('AUTH_PUBLIC_URLS') || [];
		if (config.get('DASHBOARD_ENABLED')) {
			publicUrls.push(config.get('DASHBOARD_URL'));
		}
		var url, method;
		publicUrls.forEach(function(publicUrl){
			if (typeof publicUrl === 'string') {
				url = publicUrl;
				method = 'GET';
			} else if (publicUrl.url) {
				url = publicUrl.url;
				method = publicUrl.method || 'GET';
			}
			if (req.url.indexOf(url, 0) === 0 && req.method === method) {
				isPublicUrl = true;
			};
		});

		if (authorized(req) || isPublicUrl) {
			next();
		} else {
			// TODO More info?
			log.debug('Auth middleware denied request for:', req.url);
			res.status(401).send('Unauthorized');
		};	
	}

};
