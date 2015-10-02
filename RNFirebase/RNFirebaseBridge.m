//
//  RNFirebase.m
//  RNFirebase
//
//  Created by Alonso Holmes on 10/1/15.
//  Copyright (c) 2015 Alonso Holmes. All rights reserved.
//

#import "RCTBridgeModule.h"
#import "RCTLog.h"
#import "Firebase.h"

@interface RCT_EXTERN_MODULE(RNFirebase, NSObject)

RCT_EXTERN_METHOD(on:(NSString *)path event:(NSString *)event);
RCT_EXTERN_METHOD(off:(NSString *)path);

@end