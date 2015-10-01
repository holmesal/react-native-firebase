var Firebase = require('./RNFirebase');

var ref = new Firebase('https://podcast.firebaseio.com/test');

ref.on('child_added', (snap) => {
	console.info('got value!');
	console.info(snap.val());
});

console.info(`the path for this ref is ${ref.toString()}`);