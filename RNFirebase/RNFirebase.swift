//
//  RNFirebase.swift
//  RNFirebase
//
//  Created by Alonso Holmes on 10/1/15.
//  Copyright (c) 2015 Alonso Holmes. All rights reserved.
//

import Foundation
import Firebase
import FBSDKLoginKit

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
    print("initialized!");
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
    print(String(format: "Listening to path %@ and event %@", path, event));
    let ref = self.getRef(path);
    let eventType = self.getEventType(event);
    // Listen to this event at this ref
    ref.observeEventType(eventType, withBlock: { snap in
      let eventName = String(format: "RNFirebase-%@-%@", path, event);
      let val:AnyObject! = snap.value;
      var key:AnyObject! = snap.key;
//      var key:AnyObject! = "hey";
//      println(key);
//      println(val);
      if (key == nil) {
        key = "";
      }
      self.bridge.eventDispatcher.sendAppEventWithName(eventName, body: [
        "data": val,
        "key": key
      ]);
    })
  }
  
  @objc func keepSynced(path: String, shouldSync: Bool) -> Void {
    let ref = self.getRef(path);
    print("syncing \(path)");
    ref.keepSynced(shouldSync);
  }
  
  // This will remove a previously-added event listener
  // TODO - implement the ability to remove a specific listener
  @objc func off(path: String) -> Void {
    let ref = self.getRef(path);
    ref.removeAllObservers();
  }
  
  @objc func set(path: String, value: AnyObject, callback: RCTResponseErrorBlock) -> Void {
    let ref = self.getRef(path);
    ref.setValue(value, withCompletionBlock: { (err, ref) -> Void in
      print("done")
      callback(err)
    })
  }
  
  
  /**
  * Authenticatoin
  */
  
  @objc func getAuth(path: String, callback: RCTResponseSenderBlock) -> Void {
    let ref = self.getRef(path);
    self.emitAuthData(path, authData: ref.authData, callback: callback);
  }
  
  @objc func unauth(path: String) -> Void {
    let ref = self.getRef(path);
    ref.unauth();
    self.emitAuthData(path, authData: nil, callback: nil);
  }
  
  @objc func authWithFacebook(path: String, callback: RCTResponseSenderBlock) -> Void {
    let ref = self.getRef(path);
    let facebookLogin = FBSDKLoginManager();
    
    let existingAuthData:FAuthData? = ref.authData;
    
    if (existingAuthData != nil) {
      self.emitAuthData(path, authData: existingAuthData, callback: callback);
    } else {
      facebookLogin.logInWithReadPermissions(["email"], fromViewController:nil, handler: { (facebookResult, facebookError) -> Void in
        if facebookError != nil {
          print("Facebook login failed. Error \(facebookError)");
          let error:NSDictionary = RCTMakeAndLogError("facebookLoginFailed", facebookError, nil);
          self.emitAuthError(path, error: error, callback: callback);
        } else if facebookResult.isCancelled {
          print("Facebook login was cancelled.");
          let error:NSDictionary = RCTMakeError("loginCancelled", nil, nil);
          self.emitAuthError(path, error: error, callback: callback);
        } else {
          print("facebook login succeeded!");
          let accessToken = FBSDKAccessToken.currentAccessToken().tokenString;
          ref.authWithOAuthProvider("facebook", token: accessToken, withCompletionBlock: { (err, authData) -> Void in
            if err != nil {
              print("firebase auth error")
              let error:NSDictionary = RCTMakeAndLogError("firebase auth error", err, nil);
              self.emitAuthError(path, error: error, callback: callback);
            } else {
              print("auth succeeded")
              self.emitAuthData(path, authData: authData, callback: callback);
            }
          })
        }
      })
    }
  }
  
  func emitAuthError(path: String, error: NSDictionary, callback: RCTResponseSenderBlock?) -> Void {
    // Call the callback with the error
    if (callback != nil) {
      callback!([error, NSNull()]);
    }
    // Send an auth event over the bridge
    let eventName = String(format: "RNFirebase-%@-%@", path, "auth");
    self.bridge.eventDispatcher.sendAppEventWithName(eventName, body: [
      "err": error,
      "authData": NSNull()
    ]);
  }
  
  func emitAuthData(path: String, authData: FAuthData?, callback: RCTResponseSenderBlock?) -> Void {
    var safeAuthData:AnyObject;
    if (authData == nil) {
      safeAuthData = NSNull();
    } else {
      safeAuthData = [
        "uid":authData!.uid,
        "expires":authData!.expires,
        "provider":authData!.provider,
        "auth":authData!.auth,
        "token":authData!.token,
        "providerData":authData!.providerData
      ];
    }
    if (callback != nil) {
      callback!([NSNull(), safeAuthData]);
    }
    
    // Send an auth event over the bridge
    let eventName = String(format: "RNFirebase-%@-%@", path, "auth");
    self.bridge.eventDispatcher.sendAppEventWithName(eventName, body: [
      "err": NSNull(),
      "authData": safeAuthData
      ]);
  }
  
}
