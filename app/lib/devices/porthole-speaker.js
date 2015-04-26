var osascript = require('node-osascript');
var fs = require('fs');
var path = require('path')



exports.get = _get;



function _get(id, callback) {
	if (typeof id === 'function') {
		callback = id;
		id = undefined;
	}
	if (id) {
		_communicate({action: 'getSpeaker', speakerId: id}, function(error, speakerData){
			callback(null, speakerData);
		});
	} else {
		_communicate({action: 'getSpeakers'}, function(error, speakersData){
			callback(null, speakersData);
		});
	}
};


function _communicate(vars, callback) {
	osascript.executeFile(path.join(__dirname, 'porthole-speaker.scpt'), vars, function(error, result, raw){
		callback(error, _parseJSON(result));
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
