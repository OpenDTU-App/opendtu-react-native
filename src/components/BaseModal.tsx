import type { FC } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Button, Icon, Modal, Text, useTheme } from 'react-native-paper';

import { Platform } from 'react-native';

import { spacing } from '@/constants';

export interface ExtendableModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export interface BaseModalProps extends ExtendableModalProps {
  title: string;
  dismissButton:
    | false
    | 'dismiss'
    | 'cancel'
    | {
        label: string;
        onPress: () => void;
        variant?: 'text' | 'outlined' | 'contained';
        disabled?: boolean;
        textColor?: string;
      };
  dismissButtonDisabled?: boolean;
  actions?: {
    label: string;
    onPress: () => void;
    variant?: 'text' | 'outlined' | 'contained';
    disabled?: boolean;
    textColor?: string;
    loading?: boolean;
  }[];
  description?: string;
  icon?: string;
  modalProps?: Omit<ModalProps, 'visible' | 'onDismiss' | 'children'>;
  fullscreen?: boolean;
  hideBottomPadding?: boolean;
  children?: React.ReactNode;
}

const BaseModal: FC<BaseModalProps> = ({
  visible,
  onDismiss,
  title,
  description,
  fullscreen,
  children,
  dismissButton = 'dismiss',
  dismissButtonDisabled,
  actions,
  icon,
  hideBottomPadding,
  ...rest
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      dismissableBackButton
      dismissable
      {...rest.modalProps}
      style={{
        ...(Platform.OS !== 'android'
          ? { height: '100%', paddingBottom: spacing * 10 }
          : {}),
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      }}
      contentContainerStyle={{
        backgroundColor: theme.colors.surfaceVariant,
        padding: 24,
        paddingBottom: 0,
        borderRadius: fullscreen ? 0 : 28,
        marginVertical: fullscreen ? 0 : 8,
        marginHorizontal: 32,
        maxWidth: 450,
        flex: 1,
      }}
    >
      <Flex direction="column" style={{ gap: 16 }}>
        {icon ? (
          <Flex direction="row" center>
            <Icon source={icon} color={theme.colors.secondary} size={24} />
          </Flex>
        ) : null}
        <Text
          variant="headlineSmall"
          style={{
            textAlign: icon ? 'center' : undefined,
            color: theme.colors.onSurface,
          }}
        >
          {title}
        </Text>
        {description ? (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
            {description}
          </Text>
        ) : null}
      </Flex>
      {children ? <Box pt={20}>{children}</Box> : null}
      <Box pv={hideBottomPadding ? 12 : 20}>
        <Flex direction="row" justify="end" items="center" style={{ gap: 8 }}>
          {dismissButton ? (
            <Button
              onPress={
                typeof dismissButton === 'object'
                  ? dismissButton.onPress
                  : onDismiss
              }
              disabled={
                dismissButtonDisabled
                  ? dismissButtonDisabled
                  : typeof dismissButton === 'object' && dismissButton.disabled
                    ? dismissButton.disabled
                    : false
              }
              mode={
                typeof dismissButton === 'object' && dismissButton.variant
                  ? dismissButton.variant
                  : 'text'
              }
              textColor={
                typeof dismissButton === 'object' && dismissButton.textColor
                  ? dismissButton.textColor
                  : undefined
              }
            >
              {typeof dismissButton === 'object'
                ? dismissButton.label
                : dismissButton === 'cancel'
                  ? t('cancel')
                  : t('dismiss')}
            </Button>
          ) : null}
          {actions?.map((action, index) => (
            <Button
              key={`action-${index}`}
              onPress={action.onPress}
              disabled={action.disabled}
              mode={action.variant ? action.variant : 'text'}
              textColor={action.textColor}
              style={{
                paddingVertical: action.variant !== 'text' ? 0 : 8,
                minWidth: 100,
              }}
              loading={action.loading}
            >
              {action.label}
            </Button>
          ))}
        </Flex>
      </Box>
    </Modal>
  );
};

export default BaseModal;
