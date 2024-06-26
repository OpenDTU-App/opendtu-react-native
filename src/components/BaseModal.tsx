import type { FC } from 'react';
import type { ModalProps } from 'react-native-paper';
import { Modal, useTheme } from 'react-native-paper';

export interface BaseModalProps extends ModalProps {
  backgroundColor?: string;
  disableSidePadding?: boolean;
}

const BaseModal: FC<BaseModalProps> = ({
  children,
  backgroundColor,
  disableSidePadding,
  ...rest
}) => {
  const theme = useTheme();

  const { visible } = rest;

  return (
    <Modal
      {...rest}
      style={{ backgroundColor: visible ? 'rgba(0, 0, 0, 0.5)' : undefined }}
      contentContainerStyle={{
        backgroundColor: backgroundColor ?? theme.colors.elevation.level4,
        ...(disableSidePadding
          ? { paddingTop: 8, paddingBottom: 8 }
          : { padding: 8 }),
        borderRadius: 28,
        marginVertical: 8,
        marginHorizontal: 24,
      }}
    >
      {children}
    </Modal>
  );
};

export default BaseModal;
