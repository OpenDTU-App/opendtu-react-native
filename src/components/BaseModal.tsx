import type { FC } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import {
  Button,
  Icon,
  IconButton,
  Modal,
  Text,
  useTheme,
} from 'react-native-paper';

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
        padding: fullscreen ? 8 : 24,
        paddingBottom: 0,
        borderRadius: fullscreen ? 0 : 28,
        marginVertical: fullscreen ? 0 : 8,
        marginHorizontal: fullscreen ? 0 : 32,
        maxWidth: fullscreen ? undefined : 450,
        height: fullscreen ? '100%' : undefined,
        flex: 1,
        justifyContent: 'space-between',
      }}
    >
      <Box style={{ flex: fullscreen ? 1 : undefined }}>
        <Flex direction="column" style={{ gap: 16 }}>
          {icon && !fullscreen ? (
            <Flex direction="row" center>
              <Icon source={icon} color={theme.colors.secondary} size={24} />
            </Flex>
          ) : null}
          <Flex direction="row" justify="between" items="center">
            <Flex
              direction="row"
              justify="start"
              items="center"
              style={{ gap: 8, flex: 1 }}
            >
              {fullscreen && dismissButton ? (
                <IconButton icon="close" onPress={onDismiss} />
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
            </Flex>
          </Flex>
          {actions?.length && actions.length > 1 && fullscreen ? (
            <Button
              onPress={actions[0].onPress}
              disabled={actions[0].disabled}
              mode={actions[0].variant ? actions[0].variant : 'text'}
              textColor={actions[0].textColor}
              style={{
                paddingVertical: actions[0].variant !== 'text' ? 0 : 8,
                minWidth: 100,
                alignSelf: 'flex-start',
              }}
              loading={actions[0].loading}
            >
              {actions[0].label}
            </Button>
          ) : null}
          {description && !fullscreen ? (
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurface }}
            >
              {description}
            </Text>
          ) : null}
        </Flex>
        {children ? (
          <Box pt={fullscreen ? 0 : 20} style={{ flex: fullscreen ? 1 : 0 }}>
            {children}
          </Box>
        ) : null}
      </Box>
      {fullscreen ? null : (
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
                    : typeof dismissButton === 'object' &&
                        dismissButton.disabled
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
      )}
    </Modal>
  );
};

export default BaseModal;
