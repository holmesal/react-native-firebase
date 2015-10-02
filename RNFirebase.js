var Firebase = require('firebase');
var React = require('react-native');
var FirebaseDataSnapshot = require('./RNFirebaseDataSnapshot')
var {RNFirebase} = React.NativeModules;

var {NativeAppEventEmitter} = React;

class FirebaseBridge extends Firebase {

	constructor(path) {
		console.info('new instance created')
		// Create a firebase reference, to be returned
		super(path);

		return this;
	}

	/**
	* Methods specific to this implementation, not direct ports of firebase methods
	*/

	// Given an event string type, get the event key for use over the bridge
	getEventKey(event) {
		return `RNFirebase-${this.toString()}-${event}`;
	}

	// Given some data passed over the bridge, create a data snapshot and call the registered callback
	handleEvent(data, callback) {
		// console.info('got event', data);
		let snap = new FirebaseDataSnapshot(data);
		callback(snap);
	}

	// Mention that the method called is not implemented
	notImplemented() {
		console.error(`${arguments.callee.caller.name} is not implemented :-(`);
	}

	/**
	* Firebase API methods
	*/
	on(eventType, callback) {
		console.info(this.toString());
		// Listen to this location
		RNFirebase.on(this.toString(), eventType);
		// Listen for events emitted on this ref
		NativeAppEventEmitter.addListener(this.getEventKey(eventType), (data) => {
			this.handleEvent(data, callback);
		});
	}

	off(eventType, callback, context) {
		if (eventType || callback || context) {
			console.warn('You seem to be calling .off() with an eventType or a callback, which is currently unsupported. For this call, all listeners will be removed from this ref.')
		}
		RNFirebase.off(this.toString());
		NativeAppEventEmitter.removeAllListeners(this.getEventKey(eventType));
	}

	set(value, onComplete) {
		console.info('setting');
		RNFirebase.set(this.toString(), value, onComplete);
	}


	// Auth methods need a plan, and an implementation
	auth() {
		this.notImplemented()
	}
}

module.exports = FirebaseBridge;