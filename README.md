<img align="left" alt="Pedi Crisis 2.0 Logo" width="128" src="./www/img/logo.png">

# Pedi Crisis 2.0

This app contains peer-reviewed algorithms for treating over 26 pediatric crisis situations. As an interactive version of the [SPA critical event checklists](http://www.pedsanesthesia.org/critical-events-checklist/), crucial details for these pediatric critical events are now just a 'tap' away on your pocket device!

You can download the latest version of this app in the [iOS App Store](https://itunes.apple.com/us/app/pedi-crisis-2-0/id1409734476) or [Google Play Store](https://play.google.com/store/apps/details?id=org.pedsanesthesia.crisis).

## Getting Started

1. Install Git, Node and NPM. These versions should work well:
   - `node --version` v20.16.0
   - `npm --version` 10.8.1
   - `git --version` 2.46.0
2. Install [Cordova](https://cordova.apache.org/docs/en/12.x/guide/cli/installation.html)
   - `npm install -g cordova` (you may need to use `sudo` in linux/mac)
   - `cordova --version` 12.0.0
3. Clone this repo
   - Via HTTPS: `git clone https://github.com/MikeA1/pedi-crisis.git`
   - Via SSH: `git clone git@github.com:MikeA1/pedi-crisis.git`
4. Restore packages
   - Windows: consider disabling symlinks for compiled node packages, via `npm install --no-bin-links`.
   - In the root project folder (which contains the file _package.json_): `npm update`
5. Start debugging
   - Debug with browser: `cordova platform add browser` and then `cordova run browser`.

## Platforms

### Browser
This should work after Getting Started is completed. No additional steps needed!

### Android
Follow [these steps](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#requirements-and-support):

Gotchas:
-

### iOS
Follow [these steps](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/index.html).
4JveSxJjCDpLE3WQuqDNKd5lQys#RHPf564SFqge