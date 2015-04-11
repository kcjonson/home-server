

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
		output += _stringifyArguments(args);
		console.log(output);
	}
}