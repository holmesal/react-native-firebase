//
//  RNFirebase.swift
//  RNFirebase
//
//  Created by Alonso Holmes on 10/1/15.
//  Copyright (c) 2015 Alonso Holmes. All rights reserved.
//

import Foundation
import Firebase

/**

{
  <absolute reference location>:<event type>: FirebaseReference
}

*/

@objc(RNFirebase)
class RNFirebase: NSObject {
  
  var refs: [String:Firebase]
  
  var bridge: RCTBridge!
    
  override init() {
    println("initialized!");
//    var testRef = Firebase(url: "http://podcast.firebaseio.com/users");
//    testRef.observeEventType(.Value, withBlock: {
//        snapshot in
//        println("\(snapshot.key) -> \(snapshot.value)")
//    })
    
//    RCTFormatLog(NSDate(), RCTLogLevel.Info, nil, nil, "test log from firebase component!");
    
    self.refs = [:];
  }
  
  // Return an existing ref, or create one if none exists
  func getRef(path: String) -> Firebase! {
    if((self.refs[path]) == nil) {
      self.refs[path] = Firebase(url: path);
    }
    return self.refs[path];
  }
  
  // Maps string event types to Firebase event types
  func getEventType(stringEvent: String) -> FEventType {
    switch stringEvent {
      case "value":
        return FEventType.Value
      case "child_added":
        return FEventType.ChildAdded
      case "child_moved":
        return FEventType.ChildMoved
      case "child_removed":
        return FEventType.ChildRemoved
      default:
        return FEventType.Value
    }
  }

  // This will be called over the bridge when an event listener is to be added
  // when data changes at this location, we'll emit events. why not use a callback?
  // callbacks are designed to be called once (see https://facebook.github.io/react-native/docs/native-modules-ios.html#callbacks)
  @objc func on(path: String, event: String) -> Void {
    println(String(format: "Listening to path %@ and event %@", path, event));
    let ref = self.getRef(path);
    let eventType = self.getEventType(event);
    // Listen to this event at this ref
    ref.observeEventType(eventType, withBlock: { snap in
      let eventName = String(format: "RNFirebase-%@-%@", path, event);
      let val:AnyObject = snap.value;
      let key = snap.key;
      self.bridge.eventDispatcher.sendAppEventWithName(eventName, body: [
        "data": val,
        "key": key
      ]);
    })
  }
  
  // This will remove a previously-added event listener
  // TODO - implement the ability to remove a specific listener
  @objc func off(path: String) -> Void {
    let ref = self.getRef(path);
    ref.removeAllObservers();
  }
  
  @objc func set(path: String, value: AnyObject, callback: RCTResponseErrorBlock) -> Void {
    let ref = self.getRef(path);
//    ref.setValue(value, withCompletionBlock: { (err, ref) -> Void in
//      callback(err)
//    })
    ref.setValue(value, withCompletionBlock: { (err, ref) -> Void in
      println("done")
      callback(err)
    })
  }
  
}
