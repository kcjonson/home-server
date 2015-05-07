var osascript = require('node-osascript');
var path = require('path')

exports.get = _get;
exports.set = _set;


function _get(id, callback) {
	if (typeof id === 'function') {
		callback = id;
		id = undefined;
	}
	if (id) {
		_communicate('getSpeaker', {speakerId: id}, function(err, speakerData){
			callback(err, speakerData);
		});
	} else {
		_communicate('getSpeakers', null, function(err, speakersData){
			callback(err, speakersData);
		});
	}
};

function _set(id, props, callback) {
	callback();
};


function _communicate(script, vars, callback) {
	var scriptPath = path.join(__dirname, '/porthole-speaker/' + script + '.scpt');
	osascript.executeFile(scriptPath, vars, function(error, result, raw){
		if (error) {
			callback(error);
			return;
		}
		var parsedResult = _parseJSON(result);
		if (typeof parsedResult == 'object') {
			callback(null, parsedResult);
			return;
		} else {
			callback('Unable to communicate with porthole-speakers');
		}
	});
}

function _parseJSON(string) {
	if (typeof string === 'string') {
		string = string.split('\\"').join('\"');
		string = string.replace('\"', '')
		string = string.substring(0,string.lastIndexOf('\"'));
		return JSON.parse(string).data;
	} else {
		return;
	}
}