import type { FC } from 'react';
import type { ModalProps } from 'react-native-paper';
import { Modal, useTheme } from 'react-native-paper';

import { Platform } from 'react-native';

import { spacing } from '@/constants';

export interface BaseModalProps extends ModalProps {
  backgroundColor?: string;
  disableSidePadding?: boolean;
  disableSideMargin?: boolean;
  isScreen?: boolean;
}

const BaseModal: FC<BaseModalProps> = ({
  children,
  backgroundColor,
  disableSidePadding,
  disableSideMargin,
  isScreen,
  ...rest
}) => {
  const theme = useTheme();

  if (isScreen) {
    disableSideMargin = true;
    disableSidePadding = true;
  }

  const { visible } = rest;

  return (
    <Modal
      {...rest}
      style={{
        ...(Platform.OS !== 'android'
          ? { height: '100%', paddingBottom: spacing * 10 }
          : {}),
        backgroundColor: visible ? 'rgba(0, 0, 0, 0.5)' : undefined,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      }}
      contentContainerStyle={{
        backgroundColor: backgroundColor ?? theme.colors.elevation.level4,
        ...(disableSidePadding
          ? { paddingTop: 8, paddingBottom: 8 }
          : { padding: 8 }),
        borderRadius: isScreen ? 0 : 28,
        marginVertical: isScreen ? 0 : 8,
        marginHorizontal: disableSideMargin ? 0 : 24,
        maxWidth: 450,
        flex: 1,
      }}
    >
      {children}
    </Modal>
  );
};

export default BaseModal;
