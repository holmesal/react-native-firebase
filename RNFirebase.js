require('console-shim');
var Firebase = require('firebase');
var React = require('react-native');
var FirebaseDataSnapshot = require('./RNFirebaseDataSnapshot')
var FirebaseQuery = require('./RNFirebaseQuery')
var {RNFirebase} = React.NativeModules;
var {NativeAppEventEmitter} = React;

class FirebaseRef extends Firebase {

	constructor(path) {
		// console.debug('new instance created: ', path)
		// Create a firebase reference, to be returned
		super(path);
		this._ref = new Firebase(path);

		// Calling query methods should create a new FirebaseQuery
		// and invoke the query method on it
		let queryMethods = ['orderByChild', 'orderByKey', 'orderByValue', 'orderByPriority', 'startAt', 'endAt', 'equalTo', 'limitToFirst', 'limitToLast', 'limit'];
		queryMethods.map((method) => {
			this[method] = function() {
				let q = new FirebaseQuery(this);
				q[method].apply(q, arguments);
				return q;
			}
		});

		return this;
	}

	child(path) {
		// console.info('child path: ', path);
		let newRef = this._ref.child(path);
		// console.info('new ref: ', newRef.toString());
		return new FirebaseRef(newRef.toString());
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
		// console.debug('got event', ev);
		let snap = new FirebaseDataSnapshot(ev.data, ref);
		callback(snap);
	}

	// Mention that the method called is not implemented
	notImplemented() {
		console.error(`[RNFirebase] ${arguments.callee.caller.name} is not implemented :-(`);
	}

	/**
	* Firebase API methods
	*/
	on(eventType, callback) {
		// console.info(this.toString(), eventType);
		// Listen to this location
		RNFirebase.on(this.toString(), eventType);
		// Listen for events emitted on this ref
		NativeAppEventEmitter.addListener(this.getEventKey(eventType), (ev) => {
			// If this data has a different key, then we're dealing with a child
			if (ev.key === "") {
				ev.key = null;
			}
			if (ev.key !== this.key()) {
				var ref = this.child(ev.key);
			} else {
				var ref = this;
			}
			this.handleEvent(ev, ref, callback);
		});
	}

	off(eventType, callback, context) {
		if (eventType || callback || context) {
			console.warn('[RNFirebase] You seem to be calling .off() with an eventType or a callback, which is currently unsupported. For this call, all listeners will be removed from this ref.')
		}
		RNFirebase.off(this.toString());
		NativeAppEventEmitter.removeAllListeners(this.getEventKey(eventType));
	}

	set(value, onComplete) {
		RNFirebase.set(this.toString(), value, onComplete);
	}

	push(value) {
		// Create the child path using the js sdk
		let childPath = this._ref.push().toString()
		// Create a new instance of yourself with this path
		let childRef = new FirebaseRef(childPath)
		// If data was passed, immediately set it
		if (value) {
			childRef.set(value);
		}
		return childRef
		// this.notImplemented()
		// RNFirebase.push(this.toString(), value, onComplete)
	}

	ref() {
		return this;
	}

	keepSynced(shouldSync) {
		RNFirebase.keepSynced(this.toString(), shouldSync);
	}



	// Authentication

	getAuth(callback) {
		RNFirebase.getAuth(this.toString(), callback);
	}

	onAuth(callback) {
		NativeAppEventEmitter.addListener(this.getEventKey('auth'), (ev) => {
			callback(ev.err, ev.authData);
		});
		// Force an auth check right away
		RNFirebase.getAuth(this.toString(), ()=>{});
	}

	offAuth(callback, context) {
		if (callback || context) {
			console.warn('[RNFirebase] You seem to be calling .offAuth() with an eventType or a callback, which is currently unsupported. For this call, all listeners will be removed from the auth event.')
		}
		NativeAppEventEmitter.removeAllListeners(this.getEventKey('auth'));
	}

	unauth() {
		RNFirebase.unauth(this.toString());
	}

	authWithFacebook(callback) {
		RNFirebase.authWithFacebook(this.toString(), callback);
	}


	// These methods need some love
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

module.exports = FirebaseRef;