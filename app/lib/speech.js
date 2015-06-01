var exec = require('child_process').exec

exports.say = _say;


function _say(string) {
	exec('say \'' + string + '\'')
}