var _ = require('lodash')
var React = require('react-native');
var FirebaseDataSnapshot = require('./RNFirebaseDataSnapshot')
var {RNFirebase} = React.NativeModules;
var {NativeAppEventEmitter} = React;
/**

Basic approach - serialize the query operations, pass them over the bridge, and apply them on the objective-c side.

Good first task - create a superclass for methods like .on() and .getEventKey() to reduce the amount of copy pasta between this class and RNFirebase

*/

class FirebaseQuery {

	constructor(ref) {
		this.ref = ref;
		// We'll keep track of query operations and order in an array, which we'll pass over the bridge
		this.operations = [];
	}

	notImplemented() {
		console.error(`${arguments.callee.caller.name} is not implemented :-(`);
	}

	serializeSingleOperation(op) {
		return _.map(op, (v, k) => {
			if (k != 'name'){
				return `${k}=${v},`
			}
		})
	}

	serializeOperations() {
		return _.map(this.operations, (o) => {
			return `:${o.name}(${this.serializeSingleOperation(o)}):`
		});
	}

	// Given an event string type, get the event key for use over the bridge
	getEventKey(event) {
		return `RNFirebase-${this.ref.toString()}-${event}-${this.serializeOperations()}`;
	}

	// Ref-like operations
	on(eventType, callback) {
		let eventKey = this.getEventKey(eventType)
		RNFirebase.onQuery(this.ref.toString(), eventType, this.operations, eventKey);
		// Listen for events emitted on this ref
		NativeAppEventEmitter.addListener(eventKey, (ev) => {
			// If this data has a different key, then we're dealing with a child
			console.info(ev, this)
			if (ev.key === "") {
				ev.key = null;
			}
			if (ev.key !== this.ref.key()) {
				var ref = this.ref.child(ev.key());
			} else {
				var ref = this;
			}
			this.handleEvent(ev, ref, callback);
		});
	}

	// Given some data passed over the bridge, create a data snapshot and call the registered callback
	handleEvent(ev, ref, callback) {
		// console.debug('got event', ev);
		let snap = new FirebaseDataSnapshot(ev.data, ref);
		callback(snap);
	}

	off() {
		this.notImplemented()
	}

	once() {
		this.notImplemented()
	}

	ref() {
		return this.ref;
	}

	// Query methods

	orderByChild(key) {
		this.operations.push({
			name: 'orderByChild',
			key: key
		});
		return this;
	}

	orderByKey(key) {
		this.operations.push({
			name: 'orderByKey'
		});
		return this;
	}

	orderByValue() {
		this.operations.push({
			name: 'orderByValue'
		});
		return this;
	}

	orderByPriority() {
		this.operations.push({
			name: 'orderByPriority'
		});
		return this;
	}

	startAt(value, key) {
		if (key) {
			this.operations.push({
				name: 'startAtValueAndKey',
				value: value,
				key: key
			});
		} else {
			this.operations.push({
				name: 'startAtValue',
				value: value
			});
		}
		return this;
	}

	endAt(value, key) {
		if (key) {
			this.operations.push({
				name: 'endAtValueAndKey',
				value: value,
				key: key
			});
		} else {
			this.operations.push({
				name: 'endAtValue',
				value: value
			});
		}
		return this;
	}

	equalTo(value, key) {
		if (key) {
			this.operations.push({
				name: 'equalToValueAndKey',
				value: value,
				key: key
			});
		} else {
			this.operations.push({
				name: 'equalToValue',
				value: value
			});
		}
		return this;
	}

	limitToFirst(limit) {
		this.operations.push({
			name: 'limitToFirst',
			limit: limit
		});
		return this;
	}

	limitToLast(limit) {
		this.operations.push({
			name: 'limitToLast',
			limit: limit
		});
		return this;
	}

	limit(limit) {
		this.operations.push({
			name: 'limit',
			limit: limit
		});
		return this;
	}
}

module.exports = FirebaseQuery;