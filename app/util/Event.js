var log = require('../lib/log');


exports.emit = function(emitter, props) {
	console.log('Event.emit', props);

	// Generic Event
	log.debug('Emitting: ' + props.name, JSON.parse(JSON.stringify(props.data)));
	emitter.emit(props.name, JSON.parse(JSON.stringify(props.data)));  // TODO: Data payload should have IDs

	// Device Specific Event
	if (props.id) {
		log.debug('Emitting: ' + props.name + "[" + props.id + "]")
		emitter.emit(props.name + "[" + props.id + "]",  JSON.parse(JSON.stringify(props.data)));
	}

	// Property Specifc Event
	if (props.data) {
		for (var key in props.data) {
			if (props.data.hasOwnProperty(key)) {
				
				log.debug('Emitting: ' + props.name + ':' + key, JSON.parse(JSON.stringify(props.data[key])))
				emitter.emit(props.name + ':' + key, JSON.parse(JSON.stringify(props.data[key])))

				if (props.id) {
					log.debug('Emitting: ' + props.name + "[" + props.id + "]:" + key)
					emitter.emit(props.name + "[" + props.id + "]:" + key, JSON.parse(JSON.stringify(props.data[key])));
				} 
			}
		}
	}

};

exports.parseEvent = function(event) {
	console.log('Event.parseEvent', event);
	return {
		name: event.split(':')[0].split("[")[0],
		id: event.split(':')[0].split("[")[1],
		property: event.split(':')[1]
	}
}