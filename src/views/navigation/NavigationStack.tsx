import type {
  NavigationProp,
  ParamListBase,
  RouteProp,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { FC } from 'react';

import { useAppSelector } from '@/store';
import AboutOpenDTUScreen from '@/views/navigation/screens/AboutOpenDTUScreen';
import AboutSettingsScreen from '@/views/navigation/screens/AboutSettingsScreen';
import ConfigureGraphsScreen from '@/views/navigation/screens/ConfigureGraphsScreen';
import DebugScreen from '@/views/navigation/screens/DebugScreen';
import DeviceListScreen from '@/views/navigation/screens/DeviceListScreen';
import DeviceSettingsScreen from '@/views/navigation/screens/DeviceSettingsScreen';
import LicensesScreen from '@/views/navigation/screens/LicensesScreen';
import MainScreen from '@/views/navigation/screens/MainScreen';
import ManageDatabasesScreen from '@/views/navigation/screens/ManageDatabasesScreen';
import MqttInformationScreen from '@/views/navigation/screens/MqttInformationScreen';
import NetworkInformationScreen from '@/views/navigation/screens/NetworkInformationScreen';
import NtpInformationScreen from '@/views/navigation/screens/NtpInformationScreen';
import SelectDatabaseScreen from '@/views/navigation/screens/SelectDatabaseScreen';
import SetupAddOpenDTUScreen from '@/views/navigation/screens/SetupAddOpenDTUScreen';
import SetupAuthenticateOpenDTUInstanceScreen from '@/views/navigation/screens/SetupAuthenticateOpenDTUInstanceScreen';
import SetupOpenDTUCompleteScreen from '@/views/navigation/screens/SetupOpenDTUCompleteScreen';

export type PropsWithNavigation = {
  navigation: NavigationProp<ParamListBase>;
  route: RouteProp<ParamListBase>;
};

const Stack = createNativeStackNavigator();

const NavigationStack: FC = () => {
  const hasConfigs = useAppSelector(
    state => state.settings.dtuConfigs.length > 0,
  );

  return (
    <Stack.Navigator
      initialRouteName={hasConfigs ? 'MainScreen' : 'SetupAddOpenDTUScreen'}
      screenOptions={{
        headerBackVisible: false,
        headerTitle: '',
        headerTransparent: true,
      }}
    >
      <Stack.Screen
        name="MainScreen"
        component={MainScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DeviceListScreen"
        component={DeviceListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SetupAddOpenDTUScreen"
        component={SetupAddOpenDTUScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SetupAuthenticateOpenDTUInstanceScreen"
        component={SetupAuthenticateOpenDTUInstanceScreen}
        options={{ headerBackVisible: true }}
      />
      <Stack.Screen
        name="SetupOpenDTUCompleteScreen"
        component={SetupOpenDTUCompleteScreen}
      />
      <Stack.Screen
        name="DeviceSettingsScreen"
        component={DeviceSettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SelectDatabaseScreen"
        component={SelectDatabaseScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ManageDatabasesScreen"
        component={ManageDatabasesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AboutSettingsScreen"
        component={AboutSettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ConfigureGraphsScreen"
        component={ConfigureGraphsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AboutOpenDTUScreen"
        component={AboutOpenDTUScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NetworkInformationScreen"
        component={NetworkInformationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NtpInformationScreen"
        component={NtpInformationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MqttInformationScreen"
        component={MqttInformationScreen}
        options={{ headerBackVisible: true }}
      />
      <Stack.Screen
        name="LicensesScreen"
        component={LicensesScreen}
        options={{ headerBackVisible: true }}
      />
      <Stack.Screen
        name="DebugScreen"
        component={DebugScreen}
        options={{ headerBackVisible: true }}
      />
    </Stack.Navigator>
  );
};

export default NavigationStack;
