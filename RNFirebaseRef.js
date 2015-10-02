var Firebase = require('firebase');
var React = require('react-native');
var FirebaseDataSnapshot = require('./RNFirebaseDataSnapshot')
var {RNFirebase} = React.NativeModules;

var {NativeAppEventEmitter} = React;

class FirebaseBridge extends Firebase {

	constructor(path) {
		console.info('new instance created: ', path)
		// Create a firebase reference, to be returned
		super(path);
		this._ref = new Firebase(path);

		return this;
	}

	child(path) {
		console.info('child path: ', path);
		let newRef = this._ref.child(path);
		console.info('new ref: ', newRef.toString());
		return new FirebaseBridge(newRef.toString());
	}

	/**
	* Methods specific to this implementation, not direct ports of firebase methods
	*/

	// Given an event string type, get the event key for use over the bridge
	getEventKey(event) {
		return `RNFirebase-${this.toString()}-${event}`;
	}

	// Given some data passed over the bridge, create a data snapshot and call the registered callback
	handleEvent(ev, ref, callback) {
		console.info('got event', ev);
		let snap = new FirebaseDataSnapshot(ev.data, ref);
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
		console.info(this.toString(), eventType);
		// Listen to this location
		RNFirebase.on(this.toString(), eventType);
		// Listen for events emitted on this ref
		NativeAppEventEmitter.addListener(this.getEventKey(eventType), (ev) => {
			// If this data has a different key, then we're dealing with a child
			if (ev.key !== this.key) {
				var ref = this.child(ev.key);
			} else {
				var ref = this;
			}
			console.info('got this far')
			this.handleEvent(ev, ref, callback);
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

	ref() {
		return this;
	}


	// Auth methods need a plan, and an implementation
	auth() {
		this.notImplemented()
	}

	parent() {
		this.notImplemented()
	}

	root() {
		this.notImplemented()
	}

	name() {
		this.notImplemented()
	}

	update() {
		this.notImplemented()
	}

	remove() {
		this.notImplemented()
	}

	push() {
		this.notImplemented()
	}

	setWithPriority() {
		this.notImplemented()
	}

	setPriority() {
		this.notImplemented()
	}

	transaction() {
		this.notImplemented()
	}
}

module.exports = FirebaseBridge;