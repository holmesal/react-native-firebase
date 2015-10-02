// https://www.firebase.com/docs/web/api/datasnapshot

class FirebaseDataSnapshot {

	constructor(data) {
		this.data = data;
	}

	notImplemented() {
		console.error(`${arguments.callee.caller.name} is not implemented :-(`);
	}

	val() {
		return this.data;
	}

	// TODO - implement these methods
	exists() {
		this.notImplemented()
	}
	child() {
		this.notImplemented()
	}
	forEach() {
		this.notImplemented()
	}
	hasChild() {
		this.notImplemented()
	}
	hasChildren() {
		this.notImplemented()
	}
	key() {
		this.notImplemented()
	}
	name() {
		this.notImplemented()
	}
	numChildren() {
		this.notImplemented()
	}
	ref() {
		this.notImplemented()
	}
	getPriority() {
		this.notImplemented()
	}
	exportVal() {
		this.notImplemented()
	}
}

module.exports = FirebaseDataSnapshot;