# OpenDTU React Native App

This is a mobile app for the [OpenDTU project by tbnobody](https://github.com/tbnobody/OpenDTU).
I am a OpenDTU user, but I am not affiliated with the original project. However, for API communication, I inspired my code by the original webapp.

## Installation
There are signed .apk files inside the "Releases" tab. As of now, the is no plan to publish to Google Play store or F-Droid. However, if you want to help with F-Droid, feel free to contact me.

## Development
There are two branches. `main` is the stable branch, `dev` is the development branch. If you want to contribute, please create a pull request to `dev`.

## Translations
Translations are inside a [submodule](https://github.com/OpenDTU-App/opendtu-react-native-translations) located in `src/translations/translation-files`.
This helps to have a better developer experience when working with Weblate.

### ToDo
- [x] App Icon
- [x] Splash Screen
- [ ] Add iOS support (currently only tested on / implemented for Android)
- [ ] Original Functionality
  - [ ] Settings
    - [ ] Network Settings
    - [ ] MQTT Settings
    - [ ] Inverter Settings
    - [ ] Security Settings
    - [ ] DTU Settings
    - [ ] Device Manager
    - [ ] Config Management
    - [ ] Firmware Upgrade with Firmware Browser
    - [ ] Device Reboot
  - [ ] Information
    - [x] System Information
    - [x] Network Information
    - [x] NTP Information
    - [x] MQTT Information
    - [ ] tbd if also console
  - [ ] Livedata
    - [x] Today's Yield 
    - [x] Power
    - [ ] Temperature & Other stats (design tbd)

### Testing
Stuff that I cannot test myself
- [ ] Multi-Inverter per DTU

### Devnotes
- Use `yarn version --patch` to bump version

### Early Screenshots
<img alt="Screenshot_1702075921" src="https://github.com/OpenDTU-App/opendtu-react-native/assets/43087936/1475799f-881d-4eb4-8b1f-1065c64a85c1" width="250">
<img alt="Screenshot_1702075907" src="https://github.com/OpenDTU-App/opendtu-react-native/assets/43087936/2edc11b3-3d33-43ef-9d22-c544fda4e72e" width="250">
<img alt="Screenshot_1702075885" src="https://github.com/OpenDTU-App/opendtu-react-native/assets/43087936/1eaa0d3c-17ee-4ab8-970d-2869887eef12" width="250">
<img alt="Screenshot_1702075874" src="https://github.com/OpenDTU-App/opendtu-react-native/assets/43087936/1a86d932-dbf5-4f08-913a-72abc95efa07" width="250">
<img alt="Screenshot_1702075762" src="https://github.com/OpenDTU-App/opendtu-react-native/assets/43087936/cd9ae39b-a204-49c3-82c7-b3bd0db29ff8" width="250">
