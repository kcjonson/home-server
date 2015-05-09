var osascript = require('node-osascript');
var path = require('path');
var log = require('../log');


exports.get = _get;
exports.set = _set;


function _get(hardwareId, callback) {
	log.debug(hardwareId);
	if (typeof hardwareId === 'function') {
		callback = hardwareId;
		hardwareId = undefined;
	}
	_communicate({command: 'get'}, function(err, speakersData){
		if (err) {callback(err); return;};
		if (hardwareId) {
			var speakerFound;
			speakersData.forEach(function(speakerData){
				if (speakerData.hardwareId == hardwareId) {
					speakerFound = speakerData;
					return;
				}
			});
			if (speakerFound) {
				callback(null, speakerFound)
			} else {
				callback('Unable to find airfoil speaker: ' + hardwareId);
			}
		} else {
			callback(null, speakersData)
		}
	});
};

function _set(hardwareId, props, callback) {
	log.debug(hardwareId, props);

	props.command = 'set';
	props.hardwareId = hardwareId;

	// volume is a reserved word.
	props.vol = props.volume;
	delete props.volume;

	_communicate(props, function(err, speakersData){
		var speakerFound;
		speakersData.forEach(function(speakerData){
			if (speakerData.hardwareId == hardwareId) {
				speakerFound = speakerData;
				return;
			}
		});
		callback(err, speakerFound);
	});
};


function _communicate(vars, callback) {
	var scriptPath = path.join(__dirname, '/airfoil-speaker.scpt');
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
			callback('Unable to communicate with airfoil-speakers');
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
