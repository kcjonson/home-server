
var indigo = require('indigo/lib/indigo');
var mongoose = require('mongoose');
var config = require('../../config/users.json');
var appConfig = require('../../config/app.json');
var UserModel = require('../models/user');



// Variables
var CONNECTION;  // Holds Ref to DB Connection



// Exports

	exports.getAll = _getAll;
	exports.findOne = _findOne;
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
					console.log('ERROR: Unable to save model to database ', error);
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
			_doFind(model, query, callback);
		} else {
			_connectDatabase(function(){
				_doFind(model, query, callback);
			})
		}
		function _doFind(model, query, callback) {
			model.findOne(query, function(error, docs){
			  	if (error) {
				  	callback('ERROR while trying to find');
			  	} else {
				  	callback(null, docs);
			  	}
		  	});
		}
	};

	function _connectDatabase(callback) {
		CONNECTION = mongoose.connect(appConfig.DATABASE_URL, function (err, res) {
			if (err) {
				console.log ('ERROR connecting to: ' + appConfig.DATABASE_URL + '. ' + err);
			} else {
				console.log ('Succeeded connected to: ' + appConfig.DATABASE_URL);
				callback();
			}
		});
	};

	function _seedDatabase() {
		console.log('Seeding Users Collection');

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
				newUser.save(function (err) {if (err) console.log ('Error on save!')});
			})
		}
	};



