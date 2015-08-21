var log = require('../lib/log');

module.exports = function auth(req, res, next) {

	// TODO: Log all requests somewhere
	
	//log.debug(req.url)
	next();

};
