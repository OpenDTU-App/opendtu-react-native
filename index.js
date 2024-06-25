/**
 * @format
 */
import { AppRegistry } from 'react-native';

import { decode, encode } from 'base-64';

import App from '@/App';

import 'moment/locale/de';
import 'moment/locale/en-gb';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import '@/utils/rsplit';
import '@/translations';
import { name as appName } from '@root/app.json';

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

AppRegistry.registerComponent(appName, () => App);
