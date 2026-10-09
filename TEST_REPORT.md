# Verification — 9 October 2026

## Passed

- `npm install`: exact pinned dependency tree installed; package lock generated.
- `npm test`: **23 tests passed, zero failures**. Covers save validation, collision, timer end, scoring, floor-mess failure, streak multipliers, splash insurance, purchases, seeded daily movement, one-time daily/achievement bonuses, daily reward streak/reset/wrap/date boundaries, consent gating, rewarded dismissal/failure, rewarded earning, interstitial dismissal/cooldown, and banner cancellation.
- `npm run build`: native Capacitor/AdMob adapter bundled successfully with esbuild; web assets copied into `www`.
- `npm run android` / `npm run sync`: Android project generated and synchronized; both native plugins registered; AdMob application ID inserted automatically.
- JavaScript syntax checks passed.
- Chromium desktop (1280 × 950), phone (390 × 844), and narrow phone (320 × 740) smoke checks: **no JavaScript runtime errors observed**.
- Browser interaction checks: menu/back navigation, pointer aiming and score, actual emulated touch input, keyboard flow, pause/resume, restart cancellation, timed results, achievement persistence, daily reward duplicate prevention, settings persistence, coin store purchases, reset cancellation, confirmed reset.
- No horizontal overflow on tested phone screens. Settings remained within the narrow viewport at 200% root text size.
- Home, play, daily, store, rewards, achievements, settings, and result screenshots visually inspected.
- Android XML parsed; application/ad metadata, package ID, launcher icons, Gradle wrapper, and included web asset references checked.
- Final ZIP integrity and required files verified.

## Still requires your Android device

This environment has no Android SDK/emulator or connected device and has JDK 17 rather than the required JDK 21. It did **not** compile an APK/AAB, sign a release, or contact the actual advertising SDK on a device. Ad flow tests use mocked native callbacks; they do not establish actual ad inventory or consent behavior.

Before release, install JDK 21/SDK 36, build in Android Studio, and verify consent, test banner placement, interstitial dismissal, rewarded completion/early dismissal, offline behavior, vibration, background pause, hardware back, and launch artwork on a physical device. Configure your own live ad IDs and support email. This ZIP is the source project, not a signed Play Store upload.

## Version 1.1 visual and sound update

- Rechecked desktop/phone layouts, touch and keyboard input, pause/navigation, purchases, rewards, persistence, and timed results.
- Verified the underlying gameplay/economy/save engine outside the theme color data is byte-for-byte unchanged. AdMob source/configuration are unchanged.
- Browser audio checks verified a nonzero continuous splash signal, distinct bowl/floor mixing, and clean release/pause/mute behavior, with no JavaScript errors.
- Four additional audio lifecycle tests cover reuse during a hold, stop/restart, pause/mute, and collision-texture transitions.
- Cached static room graphics to avoid rebuilding colored tiles on each animation frame.
- Android artwork and bundled assets rebuilt; actual Android build/device checks remain required as described above.
