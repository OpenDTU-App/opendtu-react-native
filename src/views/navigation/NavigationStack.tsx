import type { FC } from 'react';

import { useAppSelector } from '@/store';
import DebugColorsScreen from '@/views/navigation/screens/DebugGroup/DebugColorsScreen';
import DebugScreen from '@/views/navigation/screens/DebugGroup/DebugScreen';
import DeviceListScreen from '@/views/navigation/screens/DeviceGroup/DeviceListScreen';
import DeviceSettingsScreen from '@/views/navigation/screens/DeviceGroup/DeviceSettingsScreen';
import ConfigureGraphsScreen from '@/views/navigation/screens/GraphsGroup/ConfigureGraphsScreen';
import ManageDatabasesScreen from '@/views/navigation/screens/GraphsGroup/ManageDatabasesScreen';
import SelectDatabaseScreen from '@/views/navigation/screens/GraphsGroup/SelectDatabaseScreen';
import AboutAppScreen from '@/views/navigation/screens/InformationGroup/AboutAppScreen';
import FirmwareListScreen from '@/views/navigation/screens/InformationGroup/FirmwareListScreen';
import LicensesScreen from '@/views/navigation/screens/InformationGroup/LicensesScreen';
import MqttInformationScreen from '@/views/navigation/screens/InformationGroup/MqttInformationScreen';
import NetworkInformationScreen from '@/views/navigation/screens/InformationGroup/NetworkInformationScreen';
import NtpInformationScreen from '@/views/navigation/screens/InformationGroup/NtpInformationScreen';
import SystemInformationScreen from '@/views/navigation/screens/InformationGroup/SystemInformationScreen';
import InverterDataScreen from '@/views/navigation/screens/InverterGroup/InverterDataScreen';
import InverterDeviceInfoScreen from '@/views/navigation/screens/InverterGroup/InverterDeviceInfoScreen';
import InverterEventLogScreen from '@/views/navigation/screens/InverterGroup/InverterEventLogScreen';
import InverterGridProfileScreen from '@/views/navigation/screens/InverterGroup/InverterGridProfileScreen';
import InverterInfoScreen from '@/views/navigation/screens/InverterGroup/InverterInfoScreen';
import MainScreen from '@/views/navigation/screens/MainScreen';
import NetworkSettingsScreen from '@/views/navigation/screens/SettingsGroup/NetworkSettingsScreen';
import SetupAddOpenDTUScreen from '@/views/navigation/screens/SetupGroup/SetupAddOpenDTUScreen';
import SetupAuthenticateOpenDTUInstanceScreen from '@/views/navigation/screens/SetupGroup/SetupAuthenticateOpenDTUInstanceScreen';
import SetupOpenDTUCompleteScreen from '@/views/navigation/screens/SetupGroup/SetupOpenDTUCompleteScreen';

import type {
  NavigationProp,
  ParamListBase,
  RouteProp,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
      <Stack.Screen name="AboutSettingsScreen" component={AboutAppScreen} />
      <Stack.Screen
        name="ConfigureGraphsScreen"
        component={ConfigureGraphsScreen}
      />
      <Stack.Screen
        name="SystemInformationScreen"
        component={SystemInformationScreen}
      />
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
      <Stack.Screen name="DebugColorsScreen" component={DebugColorsScreen} />
      <Stack.Screen
        name="InverterDeviceInfoScreen"
        component={InverterDeviceInfoScreen}
      />
      <Stack.Screen
        name="InverterGridProfileScreen"
        component={InverterGridProfileScreen}
      />
      <Stack.Screen name="InverterDataScreen" component={InverterDataScreen} />
      <Stack.Screen
        name="NetworkSettingsScreen"
        component={NetworkSettingsScreen}
      />
    </Stack.Navigator>
  );
};

export default NavigationStack;
