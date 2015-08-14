
var authDisabled = false;

module.exports = function(req) {

	// TODO: Provide way do disable auth

	var insecureUserId;
	if (req.cookies) {
		insecureUserId = req.cookies['remote.userId'];
	}
	if (req.session.userId || (authDisabled && insecureUserId)) {
		return true;
	} else {
		return false;
	}

}