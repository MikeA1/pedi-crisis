<img align="left" alt="Pedi Crisis 2.0 Logo" width="128" src="./www/img/logo.png">

# Pedi Crisis 2.0

This app contains peer-reviewed algorithms for treating 26 pediatric crisis situations. As an interactive version of the [SPA critical event checklists](http://www.pedsanesthesia.org/critical-events-checklist/), crucial details for these 26 pediatric critical events are now just a 'tap' away on your pocket device!

You can download the latest version of this app in the [iOS App Store](https://itunes.apple.com/us/app/pedi-crisis-2-0/id1409734476) or [Google Play Store](https://play.google.com/store/apps/details?id=org.pedsanesthesia.crisis).

## Getting Started

1. Install Git, Node and NPM. These versions should work well:
   - `node --version` v8.9 (or greater)
   - `npm --version` 4.6 (or greater, but NPM v5 is sketchy, so consider a downgrade via `npm install -g npm@4`).
   - `git --version` 2.14 (or greater)
2. Install [PhoneGap](http://docs.phonegap.com/getting-started/1-install-phonegap/cli/)
   - `npm install -g phonegap` (you may need to use `sudo` in linux/mac)
   - `phonegap --version` 9.0.0 (or greater)
3. Fork and Clone this repo 
   - Example: `git clone https://github.com/~your~account~name~/pedi-crisis.git`
   - (or just [download the project files](https://github.com/MikeA1/pedi-crisis/archive/master.zip))
4. Restore packages
   - Windows: consider disabling symlinks for compiled node packages, via `npm install --no-bin-links`.
   - In the root project folder (which contains the file _package.json_): `npm update`
5. Start debugging
   - `phonegap serve` should output something like _listening on 192.168.1.1:3000_
      - Debug in a browser by navigating to the above IP address
      - Debug on iOS and Android with the [PhoneGap Developer](http://docs.phonegap.com/getting-started/2-install-mobile-app/) mobile app, 
         - Windows: you may need to open port 3000 in Windows Firewall.
      - Debug with a simulator for [Android](https://developer.android.com/studio/run/emulator) or [iOS](https://help.apple.com/simulator/mac/current/#/deve44b57b2a).

## Platforms

### Browser
This should work after Getting Started is completed. No additional steps needed!

### Android
Follow [these steps](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#requirements-and-support):
1. Install [Android Studio](https://developer.android.com/studio/index.html).
   - In Android Studio, open preferences, then navigate Appearance & Behavior > System Settings > Android SDK. In the SDK Platforms tab, install API Level 28.
   - Create an environment variable for `ANDROID_HOME`, set the value to the location of your Android SDK installation.
      - On Windows, this is something like `C:\Users\<UserName>\AppData\Local\Android\Sdk`
   - Edit the PATH environment variable to contain the two Android SDK paths. 
      - On Windows, this is like `C:\Users\<UserName>\AppData\Local\Android\Sdk\platform-tools` and `C:\Users\<UserName>\AppData\Local\Android\Sdk\tools`
     (e.g., `/Android/SDK/platform-tools` and `/Android/SDK/tools`).
   - Follow [these instructions](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#setting-environment-variables).
2. Create an environment variable for `JAVA_HOME`.
   - Option 1: use the JDK path already installed by Android Studio (e.g., on Windows, `C:\Program Files\Android\Android Studio\jre`)
   - Option 2: download and extract OpenJdk v1.8.0; the path is the root directory of the extracted files
      - For Windows, try [OpenJdk v1.8.0_232-1](https://github.com/ojdkbuild/ojdkbuild).
3. Edit the PATH environment variable to contain the Gradle path.
   - Download and extract [Gradle](https://gradle.org/install/) [version 4.10.3](https://services.gradle.org/distributions/gradle-4.10.3-bin.zip); the path is the `\bin` directory of the extracted files
5. Build! `phonegap build android`
   - Linux/Mac: If you receive the error "spawn: EACCES", then run the following command: 
   ```
   sudo chmod 777 "/Applications/Android Studio.app/Contents/gradle/gradle-4.1/bin/gradle"
   ```
   Watch the space in "Android Studio.app"! See [this GitHub comment](https://github.com/ionic-team/ionic-cli/issues/2835#issuecomment-340200015) for details.
6. Open Android Studio. Follow [these instructions](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#opening-a-project-in-android-studio) to start debugging on a physical or emulated device. 

### iOS
Follow [these steps](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/index.html).
