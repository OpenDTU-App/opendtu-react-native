import type { FC } from 'react';
import type { ModalProps } from 'react-native-paper';
import { Modal, useTheme } from 'react-native-paper';

const BaseModal: FC<ModalProps> = ({ children, ...rest }) => {
  const theme = useTheme();
  return (
    <Modal
      {...rest}
      contentContainerStyle={{
        backgroundColor: theme.colors.elevation.level3,
        padding: 8,
        borderRadius: 28,
        marginVertical: 8,
        marginHorizontal: 24,
      }}
      style={{ backgroundColor: 'transparent' }}
    >
      {children}
    </Modal>
  );
};

export default BaseModal;
