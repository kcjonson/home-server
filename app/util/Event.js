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
	if (props.data && props.property) {

		log.debug('Emitting: ' + props.name + ':' + props.property, props.data[props.property])
		emitter.emit(props.name + ':' + props.property, JSON.parse(JSON.stringify(props.data[props.property])))

		if (props.id) {
			log.debug('Emitting: ' + props.name + "[" + props.id + "]:" + props.property, props.data[props.property])
			emitter.emit(props.name + "[" + props.id + "]:" + props.property, JSON.parse(JSON.stringify(props.data[props.property])));
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