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
import InverterEventLogScreen from '@/views/navigation/screens/InverterEventLogScreen';
import InverterInfoScreen from '@/views/navigation/screens/InverterInfoScreen';
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
import FirmwareListScreen from '@/views/navigation/screens/FirmwareListScreen';

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
        headerShown: false,
        headerBackVisible: false,
        headerTitle: '',
        headerTransparent: true,
      }}
    >
      <Stack.Screen name="MainScreen" component={MainScreen} />
      <Stack.Screen name="DeviceListScreen" component={DeviceListScreen} />
      <Stack.Screen
        name="SetupAddOpenDTUScreen"
        component={SetupAddOpenDTUScreen}
      />
      <Stack.Screen
        name="SetupAuthenticateOpenDTUInstanceScreen"
        component={SetupAuthenticateOpenDTUInstanceScreen}
      />
      <Stack.Screen
        name="SetupOpenDTUCompleteScreen"
        component={SetupOpenDTUCompleteScreen}
      />
      <Stack.Screen
        name="DeviceSettingsScreen"
        component={DeviceSettingsScreen}
      />
      <Stack.Screen
        name="SelectDatabaseScreen"
        component={SelectDatabaseScreen}
      />
      <Stack.Screen
        name="ManageDatabasesScreen"
        component={ManageDatabasesScreen}
      />
      <Stack.Screen
        name="AboutSettingsScreen"
        component={AboutSettingsScreen}
      />
      <Stack.Screen
        name="ConfigureGraphsScreen"
        component={ConfigureGraphsScreen}
      />
      <Stack.Screen name="AboutOpenDTUScreen" component={AboutOpenDTUScreen} />
      <Stack.Screen
        name="NetworkInformationScreen"
        component={NetworkInformationScreen}
      />
      <Stack.Screen
        name="NtpInformationScreen"
        component={NtpInformationScreen}
      />
      <Stack.Screen
        name="MqttInformationScreen"
        component={MqttInformationScreen}
      />
      <Stack.Screen name="LicensesScreen" component={LicensesScreen} />
      <Stack.Screen name="DebugScreen" component={DebugScreen} />
      <Stack.Screen name="InverterInfoScreen" component={InverterInfoScreen} />
      <Stack.Screen
        name="InverterEventLogScreen"
        component={InverterEventLogScreen}
      />
      <Stack.Screen name="FirmwareListScreen" component={FirmwareListScreen} />
    </Stack.Navigator>
  );
};

export default NavigationStack;
