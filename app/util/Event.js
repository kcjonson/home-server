var log = require('../lib/log');


exports.emit = function(emitter, props) {

	// Generic Event
	//log.debug('Emitting: ' + props.name, props);
	emitter.emit(props.name, JSON.parse(JSON.stringify(props)));  // TODO: Data payload should have IDs

	// Device Specific Event
	if (props.id) {
		//log.debug('Emitting: ' + props.name + "[" + props.id + "]", props);
		emitter.emit(props.name + "[" + props.id + "]",  JSON.parse(JSON.stringify(props)));
	}

	// Property Specifc Event
	if (props.data && props.property) {
		//log.debug('Emitting: ' + props.name + ':' + props.property, props);
		emitter.emit(props.name + ':' + props.property, JSON.parse(JSON.stringify(props)))
		if (props.id) {
			//log.debug('Emitting: ' + props.name + "[" + props.id + "]:" + props.property, props)
			emitter.emit(props.name + "[" + props.id + "]:" + props.property, JSON.parse(JSON.stringify(props)));
		} 
	}

};

exports.parseEvent = function(event) {
	return {
		name: event.split(':')[0].split("[")[0],
		id: event.split(':')[0].split("[")[1],
		property: event.split(':')[1]
	}
}