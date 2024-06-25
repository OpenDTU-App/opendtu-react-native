/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { FC } from 'react';
import type { ScrollViewProps } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import type { SafeAreaViewProps } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScrollView, View } from 'react-native';

import styled from 'styled-components';

import { DarkTheme, DefaultTheme } from '@react-navigation/native';

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

export const StyledScrollView: FC<StyledScrollViewProps> = props => {
  const rnpTheme = useTheme();
  const theme = props.theme ?? rnpTheme;

  return (
    <ScrollView
      {...props}
      style={{
        backgroundColor: theme.colors.background,
        // @ts-ignore
        color: theme.colors.onBackground,
        width: '100%',
      }}
    />
  );
};

export type StyledSafeAreaViewProps = {
  theme?: MD3Theme;
} & SafeAreaViewProps;

const InternalStyledSafeAreaView = styled(SafeAreaView)<{ theme: MD3Theme }>`
  height: 100%;
  flex: 1;
  align-items: center;
  background-color: ${props => props.theme.colors.background};
  display: flex;
  color: ${props => props.theme.colors.onBackground};
`;

export const StyledSafeAreaView: FC<StyledSafeAreaViewProps> = props => {
  const rnpTheme = useTheme();
  const theme = props.theme ?? rnpTheme;

  return <InternalStyledSafeAreaView theme={theme} {...props} />;
};
