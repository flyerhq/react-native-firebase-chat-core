# example

## Getting Started

```bash
yarn
```

for iOS:

```bash
npx pod-install
```

To run the app use:

```bash
yarn ios
```

or

```bash
yarn android
```

## Updating project

1. Check if there are major versions of 3rd party dependencies, update and commit these changes first
2. Remove current `example` project
3. Create a project named `example` using [react-native-better-template](https://github.com/demchenkoalex/react-native-better-template)
4. Revert `README.md` so you can see this guide
5. In `tsconfig.json` add

```json
"baseUrl": ".",
"paths": {
  "@flyerhq/react-native-chat-ui": ["../src"]
},
```

6. Check the difference in `metro.config.js` and combine all
7. Revert `src` folder
8. Revert `index.js`
9. Check the difference in `.gitignore` and combine all
10. Install all missing dependencies
11. Check the difference in `Info.plist` and combine all
12. Open Xcode and change build number from 1 to 2 and back in the UI, so Xcode will format `*.pbxproj` eliminating some changes
13. Add `GoogleService-Info.plist` to the `ios/example` folder, and then use Xcode to add this file to the project
14. Add `google-services.json` to the `android/app` folder
15. Check the difference in `android/build.gradle` and combine all
16. Check the difference in `android/app/build.gradle` and combine all
17. Check the difference in `AndroidManifest.xml`
18. Revert `firebase.json`
19. Check the difference in `android/gradle.properties` and combine all
20. Check the difference in `MainActivity.kt` and combine all
21. Check the difference in `AppDelegate.swift` and combine all
