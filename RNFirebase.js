var Firebase = require('firebase');
var {RNFirebase} = require('react-native').NativeModules;

class FirebaseBridge extends Firebase {

	constructor(path) {
		console.info('new instance created')
		super(path);
		return this;
	}

	on(eventType, callback) {
		console.info(`native on should be called here`);
	}
}

export default FirebaseBridge;