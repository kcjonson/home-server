
var indigo = require('indigo/lib/indigo');
var mongoose = require('mongoose');
var config = require('../../config/users.json');
var appConfig = require('../../config/app.json');
var UserModel = require('../models/user');
var log = require('../lib/log')



// Variables
var CONNECTION;  // Holds Ref to DB Connection



// Exports

	exports.getAll = _getAll;
	exports.findOne = _findOne;
	exports.find = _find;
	exports.save = _save;





// Private

	function _save(model, callback) {
		if (CONNECTION) {
			_doSave(model, callback);
		} else {
			_connectDatabase(function(){
				_doSave(model, callback);
			})
		}
		function _doSave(model, callback) {
			model.save(function (error) {
				if (error) {
					log.error('Unable to save model to database ', error);
				} else if (callback) {
					callback();
				}
			});
		}
	};

	function _getAll(model, callback) {
		if (CONNECTION) {
			_doFind(model, callback);
		} else {
			_connectDatabase(function(){
				_doFind(model, callback);
			})
		}
		function _doFind(model, callback) {
			model.find({}, '-password', function(error, docs){
			  	if (error) {
				  	callback('ERROR while trying to find');
			  	} else {
				  	callback(null, docs);
			  	}
		  	});
		}
	};

	function _findOne(model, query, callback) {
		if (CONNECTION) {
			_doFindOne(model, query, callback);
		} else {
			_connectDatabase(function(){
				_doFindOne(model, query, callback);
			})
		}
		function _doFindOne(model, query, callback) {
			model.findOne(query, function(error, docs){
			  	if (error) {
				  	callback('ERROR while trying to find');
			  	} else {
				  	callback(null, docs);
			  	}
		  	});
		}
	};

	function _find(model, query, fields, options, callback) {
		if (CONNECTION) {
			_doFind(model, query, fields, options, callback);
		} else {
			_connectDatabase(function(){
				_doFind(model, query, fields, options, callback);
			})
		};
		function _doFind(model, query, fields, options, callback) {
			model.find(query, fields, options, function(error, docs){
			  	if (error) {
				  	callback('ERROR while trying to find');
			  	} else {
				  	callback(null, docs);
			  	}
		  	});
		}
	}

	function _connectDatabase(callback) {
		CONNECTION = mongoose.connect(appConfig.DATABASE_URL, function (err, res) {
			if (err) {
				log.error('Failed connecting to database: ' + appConfig.DATABASE_URL + '. ' + err);
			} else {
				log.info('Connected to database: ' + appConfig.DATABASE_URL);
				callback();
			}
		});
	};

	function _seedDatabase() {
		log.debug('Seeding Users Collection');

		if (CONNECTION) {
			_doSeed();
		} else {
			_connectDatabase(function(){
				_doSeed();
			})
		}
		function _doSeed() {
			config.SEED_USERS.forEach(function(SEED_USER){
				var newUser = new UserModel(SEED_USER);
				newUser.save(function (err) {if (err) log.error('Save was unsuccessful', err)});
			})
		}
	};

	//_seedDatabase();


