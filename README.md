# RNFirebase

# wip - use cautiously

## Why?

Because the native iOS Firebase SDK rocks - it's got great [offline capabilities & caching](https://www.firebase.com/docs/ios/guide/offline-capabilities.html), and [SimpleLogin](https://www.firebase.com/docs/ios/guide/user-auth.html) works much better on native devices than in the JS SDK.

## Goal

Provide an API that mirrors Firebase's [JS SDK](https://www.firebase.com/docs/web/api/), but map the important bits to the native SDK.

I'd like to continue to use Firebase references on the JS side (to avoid re-implementing methods like `.root(), .key(), etc`, and override only methods like `.on()` and `.off()`.

## How it works

Subclass `Firebase` in JS, and in the constructor have the native SDK create a "mirror" reference. Anytime you call a method on the JS reference, RNFirebase will call the appropriate method on the "mirror" reference.

Similarly, when data is available on the native side, an event is emitted over the bridge with the (always serializable) data. This event is caught by the JS SDK, which then fires the callback you registered with "on". This callback is provided with an object that conforms to the `DataSnapshot` API, though I'm planning only to implement the basic `DataSnapshot` methods at first. `.val()` is the important one, of course.

When you call `.off()`, the corresponding reference is destroyed using the native SDK.

## JS -> iOS mappings

| JS method | iOS method |
| ------------- | ------------- |
| .on() | observeEventType:withBlock: |

When you call `new Firebase()` in javascript-land, a normal `Firebase` reference is created. Nothing happens, though, until you call a method to set or fetch data from firebase: `.on(), .update(), .set(), .remove(), (add the rest)`.

At that point, a mirror reference is created on the objective-c side (if it doesn't already exist) and 

## Good first tasks
(link to issues here)
* Add unit tests to ensure parity with the official react JS lib
