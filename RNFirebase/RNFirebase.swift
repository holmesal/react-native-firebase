//
//  RNFirebase.swift
//  RNFirebase
//
//  Created by Alonso Holmes on 10/1/15.
//  Copyright (c) 2015 Alonso Holmes. All rights reserved.
//

import Foundation
import Firebase

@objc(RNFirebase)
class RNFirebase: NSObject {
    
    init() {
        var testRef = Firebase(url: "http://podcast.firebaseio.com");
        testRef.observeEventType(.Value, withBlock: {
            snapshot in
            println("\(snapshot.key) -> \(snapshot.value)")
    })
    }
    
}
