/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import styled from 'styled-components';

import type { FC } from 'react';
import type { ScrollViewProps } from 'react-native';
import { View, ScrollView } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ReactNavigationDarkTheme = {
  ...DarkTheme,
  /*colors: {
    ...DarkTheme.colors,
    background: '#000',
    text: '#fff',
    border: '#ccc',
    notification: '#fff',
  }*/
};

export const ReactNavigationLightTheme = {
  ...DefaultTheme,
  /*colors: {
    ...DefaultTheme.colors,
    background: '#fff',
    text: '#000',
    border: '#ccc',
    notification: '#000',
  },*/
};

export const StyledView = styled(View)`
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.onBackground};
  flex: 1;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

export interface StyledScrollViewProps extends ScrollViewProps {
  theme: MD3Theme;
}

export const StyledScrollView: FC<StyledScrollViewProps> = props => (
  <ScrollView
    {...props}
    style={{
      backgroundColor: props.theme.colors.background,
      // @ts-ignore
      color: props.theme.colors.onBackground,
      width: '100%',
    }}
  />
);

export const StyledSafeAreaView = styled(SafeAreaView)<{ theme: MD3Theme }>`
  height: 100%;
  flex: 1;
  align-items: center;
  background-color: ${props => props.theme.colors.background};
  display: flex;
  color: ${props => props.theme.colors.onBackground};
`;
