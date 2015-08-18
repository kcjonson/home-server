var path = require('path');


// Statics

var LOG_LEVELS = [
	'TRACE',  	// For extremely detailed and potentially high volume logs
	'DEBUG',  	// Basic utility for developers
	'INFO',		// System status and lifecycle reporting	
	'WARN',		// Event that has minor impact on the appliction or user experience but needs attention
	'ERROR',	// Unexpected event that has a negative impact on the user experience or kills the application
	'OFF'		// Leave me alone, I know what I'm doing.
];

var LEVEL_TO_COLOR_MAP = {
	'default': '\033[0m',
	'light': '\033[90m'
};
LEVEL_TO_COLOR_MAP[LOG_LEVELS[0]] = '\033[36m';
LEVEL_TO_COLOR_MAP[LOG_LEVELS[1]] = '\033[36m';
LEVEL_TO_COLOR_MAP[LOG_LEVELS[2]] = '\033[0m';
LEVEL_TO_COLOR_MAP[LOG_LEVELS[3]] = '\033[33m';
LEVEL_TO_COLOR_MAP[LOG_LEVELS[4]] = '\033[31m';

var MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


// Set default log level based on enviroment
// NOTE: This is often overridden by the app later
var LOG_LEVEL;
switch (process.env.NODE_ENV) {
	case 'development':
	case 'staging':
		LOG_LEVEL = LOG_LEVELS[1];
		break;
	case 'production':
	default: 
		LOG_LEVEL = LOG_LEVELS[3];
}



// Log Levels

module.exports = {
	levels: LOG_LEVELS,
	setLevel: function(level) {
		// TODO, use actual log statement!
		module.exports.info('Setting log level to:', level)
		LOG_LEVEL = level;
	},
	debug: function() {
		return _doLog(arguments, 'DEBUG');
	},
	info: function() {
		return _doLog(arguments, 'INFO');
	},
	warn: function() {
		return _doLog(arguments, 'WARN');
	},
	error: _handleError.bind(this)
};


// Log Function

function _doLog(args, level) {
	if (LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(LOG_LEVEL)) {

		// Write to stdout
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
		// TODO: Switch this to directly writing to stdout so that we
		// can capture console output. -KCJ
		// NOTE: This might be a very terrible idea... -KCJ
		console.log(output);
		return  _stringifyArguments(args)

		// Write to log files
		// NOTE: The request middleware maintains its own log writing
	}
}



// Helpers

// This is temporary hack to allow logging caught errors.
// I need to think more about how I want it to work. -KCJ
function _handleError(err) {
	_doLog(arguments, 'ERROR');
	if (process.env.NODE_ENV == 'development') {
		if (err.stack && arguments.length == 1) {
			console.log(err.stack)
		}
	}
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
				if (arg && arg.message) {
					str += arg.message;
				} else {
					str += JSON.stringify(arg);
				}
				
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