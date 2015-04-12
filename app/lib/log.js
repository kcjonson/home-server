var path = require('path');

var LOG_LEVELS = [
	'DEBUG',
	'INFO',
	'WARN',
	'ERROR'
]

var LOG_LEVEL = 'INFO';

exports.debug = function() {
	_doLog(arguments, 'DEBUG');
};

exports.info = function() {
	_doLog(arguments, 'INFO');
}

exports.warn = function() {
	_doLog(arguments, 'WARN');
}

exports.error = function() {
	_doLog(arguments, 'ERROR');
}

function _stringifyArguments(args) {
	args = Array.prototype.slice.call(args);
	var str = '';
	args.forEach(function(arg, index){
		if (index > 0) {
			str += ' ';
		}
		switch (typeof arg) {
			case 'object':
				str += JSON.stringify(arg);
				break;
			default: 
				str += arg;
				break;
		}
	});
	return str;
};

function _addDate(str) {
	var now = new Date();
	str += now.getMonth();
	str += '-' + now.getDate();
	str += '-' + now.getFullYear()
	str += ' ' + now.getHours();
	str += ':' + (now.getMinutes() < 10?'0':'') + now.getMinutes();
	str += ':' + (now.getSeconds() < 10?'0':'') + now.getSeconds();
	return str;
};

function _doLog(args, level) {





	if (LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(LOG_LEVEL)) {
		var output = _addDate('') + ' [' + level + '] ';
		if (LOG_LEVEL === 'DEBUG') {
			output += '- ' + _getPath() + ' - ';
		}
		output += _stringifyArguments(args);
		console.log(output);
	}
}

function _getPath() {
	// Get Stack and Format
	var stack = new Error().stack;
	stack = stack.split('\n');
	stack = stack.splice(1);  // Remove "Error" string.

	// Grab Line and Trim
	var line = stack [3];
	var trimmedLine = line.substring(line.search('at ') + 3)

	// Extract Function Name
	var functionName = trimmedLine.substring(0, trimmedLine.search(' '));
	if (functionName.search("Object.")) {
		functionName = functionName.substring(functionName.search("Object."), "Object.".length);
	};

	// Extract Directory and Filename
	var filePath = trimmedLine.substring(trimmedLine.search(' ') + 2, trimmedLine.search(':'));
	var appDir = path.dirname(require.main.filename);
	var directory = path.relative(appDir, path.dirname(filePath));
	var file = path.basename(filePath)

	var fullPath = directory + '/' + file + ':' + functionName + '()';

	return fullPath;

}