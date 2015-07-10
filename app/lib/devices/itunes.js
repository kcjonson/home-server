var log = require('../../lib/log');
var osascript = require('node-osascript');
var path = require('path')

exports.get = _get;
exports.set = _set;


function _get(id, callback) {
	if (typeof id === 'function') {
		callback = id;
		id = undefined;
	}

	_communicate({command: 'get'}, function(err, data){
		if (err) {callback(err); return;};
		data.hardwareId = '127.0.0.1';
		data.name = 'iTunes';
		if (id) {
			callback(null, data);
		} else {
			callback(null, [data])
		}
	});
};

function _set(id, props, callback) {
	log.debug(id, props);
	props.command = 'set';
	// Playlist is a reserved word in applescript.
	props.plist = props.playlist;
	delete props.playlist;
	_communicate(props, function(err, data){
		callback(err, data);
	});
};

function _communicate(vars, callback) {
	var scriptPath = path.join(__dirname, '/iTunes.scpt');
	osascript.executeFile(scriptPath, vars, function(error, result, raw){
		if (error) {
			var message = error.message;
			if (message.lastIndexOf('(-1728)') > -1) {  // Unable to get current track (nothing is playing)
				callback(null, {})
				return;
			} else {
				log.error(error);
				callback(error.message);
				return;
			}
		}
		var parsedResult = _parseJSON(result);
		if (typeof parsedResult == 'object') {
			callback(null, parsedResult);
			return;
		} else {
			callback('Unable to communicate with itunes');
		}
	});
};

function _parseJSON(string) {
	if (typeof string === 'string') {
		string = string.split('\\"').join('\"');
		string = string.replace('\"', '')
		string = string.substring(0,string.lastIndexOf('\"'));
		return JSON.parse(string).data;
	} else {
		return;
	}
};
