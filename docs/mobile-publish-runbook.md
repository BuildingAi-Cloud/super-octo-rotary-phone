# Mobile Publish Runbook (Android and iOS)

## Prerequisites

- Android Studio and Xcode installed.
- Apple Developer and Google Play Console access.
- Signing credentials stored in secret manager.
- Release branch cut from tested commit.

## 1. Prepare Web Artifact

1. Build web app: `npm run build`.
2. Validate Capacitor config and release server URL strategy.
3. Sync Capacitor assets: `npm run mobile:sync`.

## 2. Android Release Steps

1. Open Android project: `npm run mobile:open:android`.
2. Set release signing config in Gradle.
3. Build signed AAB.
4. Upload to Play Console internal testing.
5. Run smoke tests on at least one low-end and one modern device.
6. Promote to production after QA signoff.

## 3. iOS Release Steps

1. Open iOS project: `npm run mobile:open:ios`.
2. Set release signing team/profile in Xcode.
3. Archive and validate app.
4. Upload build to TestFlight.
5. Run smoke tests with internal testers.
6. Submit to App Store after compliance checklist is complete.

## 4. Mobile Smoke Test Matrix

- Login and role switch.
- Dashboard load and navigation.
- AI chat flow.
- Connectivity recovery after offline/online switch.
- Push notification permission flow.
- Critical API-backed workflow completion.

## 5. Release Decision Gate

- No blocker crashes in internal testing.
- No auth/session regressions.
- API error rate within baseline.
- Rollback plan validated.
