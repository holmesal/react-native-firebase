# RNFirebase

## Why?

Because the native iOS Firebase SDK rocks - it's got great [offline capabilities & caching](https://www.firebase.com/docs/ios/guide/offline-capabilities.html), and [SimpleLogin](https://www.firebase.com/docs/ios/guide/user-auth.html) works much better on native devices than in the JS SDK.

## Goal

Provide an API that mirrors Firebase's [JS SDK](https://www.firebase.com/docs/web/api/), but map the important bits to the native SDK.

I'd like to continue to use Firebase references on the JS side (to avoid re-implementing methods like `.root(), .key(), etc`, and override only methods like `.on()` and `.off()`.

## Progress

None to speak of. I made an xcode project though!