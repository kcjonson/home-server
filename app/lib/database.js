
var indigo = require('indigo/lib/indigo');
var mongoose = require('mongoose');
var config = require('../../config/users.json');
var appConfig = require('../../config/app.json');
var UserModel = require('../models/user');
var log = require('../lib/log')
var ObjectId = require('mongodb').ObjectID;



// Variables
var CONNECTION;  // Holds Ref to DB Connection



// Exports

	exports.getConnection = _getConnection;
	exports.getAll = _getAll;
	exports.findOne = _findOne;
	exports.find = _find;
	exports.save = _save;
	exports.dropCollection = _dropCollection;
	exports.getCollection = _getCollection;





// Private

	function _getConnection(callback) {
		if (CONNECTION) {
			callback(CONNECTION)
		} else {
			_connectDatabase(function(){
				callback(CONNECTION)
			})
		}

	};

	function _save(model, callback) {
		if (CONNECTION) {
			_doSave(model, callback);
		} else {
			_connectDatabase(function(){
				_doSave(model, callback);
			})
		}
		function _doSave(model, callback) {
			model.save(function (error, doc) {
				if (error) {
					callback('Unable to save model to database');
				} else if (callback) {
					callback(null, doc);
				}
			});
		}
	};

	function _dropCollection(collectionName, callback) {
		if (CONNECTION) {
			_doDropCollection(collectionName, callback);
		} else {
			_connectDatabase(function(){
				_doDropCollection(collectionName, callback);
			})
		}
		function _doDropCollection(collectionName, callback) {
			// Grab the mongodb object off of the mongoose collection and use it directly.
			mongoose.connection.db.dropCollection(collectionName, callback)
		};
	};

	function _getCollection(collectionName, callback) {
		if (CONNECTION) {
			_doGetCollection(collectionName, callback);
		} else {
			_connectDatabase(function(){
				_doGetCollection(collectionName, callback);
			})
		}
		function _doGetCollection(collectionName, callback) {
			// Grab the mongodb object off of the mongoose collection and use it directly.
			mongoose.connection.db.collection(collectionName).find().toArray(callback);
		};
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

	function _findOne(modelOrCollection, query, callback) {
		if (query && query._id) {
			query._id = ObjectId(query._id.toString())
		}
		if (CONNECTION) {
			_doFindOne(modelOrCollection, query, callback);
		} else {
			_connectDatabase(function(){
				_doFindOne(modelOrCollection, query, callback);
			})
		}
		function _doFindOne(modelOrCollection, query, callback) {

			if (modelOrCollection.model) {
				modelOrCollection.findOne(query, function(error, docs){
				  	if (error) {
					  	callback('ERROR while trying to find');
				  	} else {
					  	callback(null, docs);
				  	}
			  	});
			}

			if (typeof modelOrCollection === 'string') {
				var collection = mongoose.connection.db.collection(modelOrCollection);
				if (collection) {
					collection.findOne(query, callback);
				}
			}
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






	// function _seedDatabase() {
	// 	log.debug('Seeding Users Collection');

	// 	if (CONNECTION) {
	// 		_doSeed();
	// 	} else {
	// 		_connectDatabase(function(){
	// 			_doSeed();
	// 		})
	// 	}
	// 	function _doSeed() {
	// 		config.SEED_USERS.forEach(function(SEED_USER){
	// 			var newUser = new UserModel(SEED_USER);
	// 			newUser.save(function (err) {if (err) log.error('Save was unsuccessful', err)});
	// 		})
	// 	}
	// };

	//_seedDatabase();


