var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var config = require('./config');
var log = require('./log');




// Variables
var CONNECTION;  // Holds Ref to DB Connection



// Exports

	exports.getConnection = _getConnection;
	exports.getAll = _getAll;
	exports.findOne = _findOne;
	exports.find = _find;
	exports.save = _save;
	exports.distinct = _distinct;
	exports.dropCollection = _dropCollection;
	exports.getCollection = _getCollection;





// Private

	function _getConnection(callback) {
		log.debug('')
		if (CONNECTION) {
			callback(null, mongoose.connection)
		} else {
			_connectDatabase(callback)
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
					log.error(error);
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
			_doGetAll(model, callback);
		} else {
			_connectDatabase(function(){
				_doGetAll(model, callback);
			})
		}
		function _doGetAll(model, callback) {
			model.find({}, '-password', function(error, docs){
			  	if (error) {
				  	callback('ERROR while trying to get all');
			  	} else {
				  	callback(null, docs);
			  	}
		  	});
		}
	};

	function _find(modelOrCollection, query, fields, options, callback) {
		if (query && query._id) {
			query._id = ObjectId(query._id.toString())
		}
		if (CONNECTION) {
			_doFind(modelOrCollection, query, fields, options, callback);
		} else {
			_connectDatabase(function(){
				_doFind(modelOrCollection, query, fields, options, callback);
			})
		};
		function _doFind(modelOrCollection, query, fields, options, callback) {

			if (modelOrCollection.model) {
				modelOrCollection.find(query, fields, options, function(error, docs){
				  	if (error) {
					  	callback('ERROR while trying to find');
				  	} else {
					  	callback(null, docs);
				  	}
			  	});
			} else {
				//todo
			}
		}
	}

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
				} else {
					log.error('Unable to get collection');
					callback('Unable to get collection')
				}
			}
		}
	};

	function _distinct(collection, field, callback) {
		collection = mongoose.connection.db.collection(collection);
		if (collection) {
			collection.distinct(field, callback);
		} else {
			log.error('Unable to get collection');
			callback('Unable to get collection')
		}
	};

	function _connectDatabase(callback) {
		log.debug('')


		var url = config.get('DATABASE_URL')
		if (url){
			url = 'mongodb://' + url;
			mongoose.connect(url);
			mongoose.connection.on('error', function onMongooseError(err){
				callback(log.error('Unable to connect to database: ' + err))
			}.bind(this));
			mongoose.connection.once('open', function onMongooseOpen() {
				CONNECTION = true;
				callback(null, mongoose.connection);
			}.bind(this));
		} else {
			callback(log.error('Unable to get database url from config'));
		}
	};






