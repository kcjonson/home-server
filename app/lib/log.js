var path = require('path');


// CURRENT LOG LEVEL
// TODO: Load from elseehwre?
var LOG_LEVEL = 'DEBUG';



// Statics

var LOG_LEVELS = [
	'DEBUG',
	'INFO',
	'WARN',
	'ERROR'
];

var LEVEL_TO_COLOR_MAP = {
	'default': '\033[30m',
	'light': '\033[90m'
};
LEVEL_TO_COLOR_MAP[LOG_LEVELS[0]] = '\033[36m';
LEVEL_TO_COLOR_MAP[LOG_LEVELS[1]] = '\033[30m';
LEVEL_TO_COLOR_MAP[LOG_LEVELS[2]] = '\033[33m';
LEVEL_TO_COLOR_MAP[LOG_LEVELS[3]] = '\033[31m';

var MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];





// Log Levels

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



// Log Function

function _doLog(args, level) {
	if (LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(LOG_LEVEL)) {
		var output = _addDate('');
		output += ' - '
		output += LEVEL_TO_COLOR_MAP[level];
		output += '[' + level + '] ';
		if (LOG_LEVEL === 'DEBUG') {
			output += LEVEL_TO_COLOR_MAP['light'];
			output += _getPath() + ' '
		}
		output += LEVEL_TO_COLOR_MAP[level];
		output += _stringifyArguments(args);
		output += LEVEL_TO_COLOR_MAP['default'];
		console.log(output);
	}
}



// Helpers

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
	str += now.getDate();
	str += ' ' + MONTH_NAMES[now.getMonth()];
	str += ' ' + now.getHours();
	str += ':' + (now.getMinutes() < 10?'0':'') + now.getMinutes();
	str += ':' + (now.getSeconds() < 10?'0':'') + now.getSeconds();
	return str;
};

function _getPath() {
	// Get Stack and Format
	var stack = new Error().stack;
	stack = stack.split('\n');
	stack = stack.splice(1);  // Remove "Error" string.

	// Grab Line and Trim
	var line = stack [3];
	var trimmedLine = line.substring(line.search('at ') + 3)

	// Extract Function Name
	var functionName = trimmedLine.substring(0, trimmedLine.search(' \\('));
	if (functionName.search(" \\[as ") != -1) {
		functionName = functionName.substring(0, functionName.search(" \\[as "))
	}
	if (functionName.search("Object.") != -1) {
		functionName = functionName.substring("Object.".length);
	};

	// Extract Directory and Filename
	var filePath = trimmedLine.substring(trimmedLine.search(' \\(') + 2, trimmedLine.search(':'));
	var appDir = path.dirname(require.main.filename);
	var directory = path.relative(appDir, path.dirname(filePath));
	var file = path.basename(filePath)

	var fullPath = '';
	if (directory.length > 0) {
		fullPath += directory + '/'
	}
	fullPath += file + ':' + functionName + '()';

	return fullPath;

}