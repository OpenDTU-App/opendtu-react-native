/**
 * @format
 */
import { name as appName } from '@root/app.json';
import { decode, encode } from 'base-64';

import { AppRegistry } from 'react-native';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import '@/utils/rsplit';

import App from '@/App';

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

AppRegistry.registerComponent(appName, () => App);
