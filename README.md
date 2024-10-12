# OpenDTU React Native App

This is a mobile app for the [OpenDTU project by tbnobody](https://github.com/tbnobody/OpenDTU).
I am a OpenDTU user, but I am not affiliated with the original project. However, for API communication, I inspired my code by the original webapp.

![GitHub License](https://img.shields.io/github/license/OpenDTU-App/opendtu-react-native)
[![GitHub issues](https://img.shields.io/github/issues/OpenDTU-App/opendtu-react-native)](https://github.com/OpenDTU-App/opendtu-react-native/issues)
[![Continuous Integration](https://github.com/OpenDTU-App/opendtu-react-native/actions/workflows/testing.yml/badge.svg)](https://github.com/OpenDTU-App/opendtu-react-native/actions/workflows/testing.yml)
[![GitHub Downloads (all assets, latest release)](https://img.shields.io/github/downloads/OpenDTU-App/opendtu-react-native/latest/total?label=Downloads%20for%20latest%20version)](https://github.com/OpenDTU-App/opendtu-react-native/releases/latest)

## Download

[![IzzyOnDroid Badge](https://img.shields.io/endpoint?url=https://apt.izzysoft.de/fdroid/api/v1/shield/xyz.commanderred.opendtuapp)](https://apt.izzysoft.de/fdroid/index/apk/xyz.commanderred.opendtuapp/)
[![Download App](https://img.shields.io/badge/Download%20latest%20APK%20from%20Github-27a624)](https://github.com/OpenDTU-App/opendtu-react-native/releases/latest/download/OpenDTUApp-universal-release-signed.apk)

## Features
- All the features of the original webapp
- In-App updates (Update OpenDTU firmware without leaving the app)
- Multi-Language support (Currently English and German, feel free to [contribute more](#translations))
- Dark Mode

## Installation
There are signed .apk files inside the "Releases" tab. As of now, the is no plan to publish to Google Play store ~or F-Droid~.
<br>
~However, if you want to help with F-Droid, feel free to contact me.~ Thanks to @IzzySoft for [having the app in their repo](https://apt.izzysoft.de/fdroid/index/apk/xyz.commanderred.opendtuapp/)!

iOS is set up in xCode, but there is no plan yet to publish it to the App Store, so if you want to try it, you have to clone the repository and build it manually. If you encounter any issues, feel free to open an issue.

## Development
There are two branches. `main` is the stable branch, `develop` is the development branch. If you want to contribute, please create a pull request to `develop`.

## Logging
If you want to have a nice view of the logs the app exports as a txt file, you can find the project [here](https://github.com/OpenDTU-App/opendtu-react-native-logviewer). It is hosted on GitHub pages here: [https://opendtu-app.github.io/opendtu-react-native-logviewer/](https://opendtu-app.github.io/opendtu-react-native-logviewer/)

## Translations
Translations are inside a [submodule](https://github.com/OpenDTU-App/opendtu-react-native-translations) located in `src/translations/translation-files`.
This helps to have a better developer experience when working with Weblate.

<a href="https://weblate.commanderred.xyz/engage/opendtu-react-native/">
<img src="https://weblate.commanderred.xyz/widget/opendtu-react-native/multi-auto.svg" alt="Translation status" />
</a>

### ToDo
- [x] App Icon
- [x] Splash Screen
- [x] Add iOS support
- [ ] Original Functionality
  - [ ] Settings
    - [x] Network Settings
    - [ ] MQTT Settings
    - [ ] Inverter Settings
    - [ ] Security Settings
    - [ ] DTU Settings
    - [ ] Device Manager
    - [ ] Config Management
    - [x] Firmware Upgrade with Firmware Browser
    - [ ] Device Reboot
  - [ ] Information
    - [x] System Information
    - [x] Network Information
    - [x] NTP Information
    - [x] MQTT Information
    - [ ] tbd if also console
  - [x] Livedata
    - [x] Today's Yield
    - [x] Power
    - [x] Temperature & Other stats

### Testing
Stuff that I cannot test myself
- [ ] Multi-Inverter per DTU


### Early Screenshots
<img alt="Screenshot_1702075921" src="https://github.com/OpenDTU-App/opendtu-react-native/assets/43087936/1475799f-881d-4eb4-8b1f-1065c64a85c1" width="250">
<img alt="Screenshot_1702075907" src="https://github.com/OpenDTU-App/opendtu-react-native/assets/43087936/2edc11b3-3d33-43ef-9d22-c544fda4e72e" width="250">
<img alt="Screenshot_1702075885" src="https://github.com/OpenDTU-App/opendtu-react-native/assets/43087936/1eaa0d3c-17ee-4ab8-970d-2869887eef12" width="250">
<img alt="Screenshot_1702075874" src="https://github.com/OpenDTU-App/opendtu-react-native/assets/43087936/1a86d932-dbf5-4f08-913a-72abc95efa07" width="250">
<img alt="Screenshot_1702075762" src="https://github.com/OpenDTU-App/opendtu-react-native/assets/43087936/cd9ae39b-a204-49c3-82c7-b3bd0db29ff8" width="250">
