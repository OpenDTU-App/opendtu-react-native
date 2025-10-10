import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Portal, useTheme } from 'react-native-paper';

import { removeDatabaseConfig, updateDatabaseConfig } from '@/slices/settings';

import type { DatabaseConfig } from '@/types/settings';

import BaseModal from '@/components/BaseModal';
import StyledTextInput from '@/components/styled/StyledTextInput';

import { DatabaseType } from '@/database';
import { useAppDispatch, useAppSelector } from '@/store';

export interface ManageDatabaseModalProps extends Omit<ModalProps, 'children'> {
  uuid?: string;
}

const ManageDatabaseModal: FC<ManageDatabaseModalProps> = props => {
  const { onDismiss, uuid } = props;
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { t } = useTranslation();

  const dbConfig = useAppSelector(state =>
    state.settings.databaseConfigs.find(config => config.uuid === uuid),
  );

  const [dbType, setDbType] = useState<DatabaseType>(DatabaseType.Prometheus);
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  useEffect(() => {
    if (typeof dbConfig !== 'undefined') {
      setDbType(dbConfig.databaseType ?? '');
      setBaseUrl(dbConfig.baseUrl ?? '');
      setName(dbConfig.name ?? '');
      setUsername(dbConfig.username ?? '');
      setPassword(dbConfig.password ?? '');
    }
  }, [dbConfig]);

  const handleAbort = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const handleEditDatabase = useCallback(() => {
    if (typeof uuid === 'undefined' || typeof dbConfig === 'undefined') return;

    const config = {
      name,
      databaseType: dbType,
      baseUrl,
      username,
      password,
      uuid: dbConfig.uuid,
    } as DatabaseConfig;

    dispatch(updateDatabaseConfig({ uuid, config }));
    onDismiss?.();
  }, [
    uuid,
    dbConfig,
    name,
    dbType,
    baseUrl,
    username,
    password,
    dispatch,
    onDismiss,
  ]);

  const handleDeleteDatabase = useCallback(() => {
    if (typeof uuid !== 'undefined') {
      dispatch(removeDatabaseConfig({ uuid }));
      onDismiss?.();
    }
  }, [dispatch, uuid, onDismiss]);

  const baseUrlPlaceholder = useMemo(() => {
    // Also edit in AddDatabaseModal.tsx
    switch (dbType) {
      case DatabaseType.Prometheus:
        return 'https://prometheus.example.com:9090';
      default:
        return '';
    }
  }, [dbType]);

  const valid = useMemo(() => {
    return !!name && !!baseUrl;
  }, [name, baseUrl]);

  return (
    <Portal>
      <BaseModal
        {...props}
        title={t('settings.manageDatabase', { name: dbConfig?.name })}
        onDismiss={handleAbort}
        dismissButton="cancel"
        icon="database"
        actions={[
          {
            label: t('delete'),
            onPress: handleDeleteDatabase,
            textColor: theme.colors.error,
          },
          {
            label: t('save'),
            onPress: handleEditDatabase,
            disabled: !valid,
          },
        ]}
      >
        <Box mb={4}>
          <StyledTextInput
            label={t('database.name')}
            mode="outlined"
            value={name ?? ''}
            onChangeText={setName}
            style={{ backgroundColor: theme.colors.elevation.level3 }}
          />
        </Box>
        <Box mb={4}>
          <StyledTextInput
            label={t('database.baseUrl')}
            mode="outlined"
            value={baseUrl ?? ''}
            onChangeText={setBaseUrl}
            placeholder={baseUrlPlaceholder}
            style={{ backgroundColor: theme.colors.elevation.level3 }}
          />
        </Box>
        <Box mb={4}>
          <StyledTextInput
            label={t('database.username')}
            mode="outlined"
            value={username ?? ''}
            onChangeText={setUsername}
            style={{ backgroundColor: theme.colors.elevation.level3 }}
          />
        </Box>
        <Box mb={4}>
          <StyledTextInput
            label={t('database.password')}
            mode="outlined"
            value={password ?? ''}
            onChangeText={setPassword}
            secureTextEntry
            style={{ backgroundColor: theme.colors.elevation.level3 }}
          />
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default ManageDatabaseModal;
