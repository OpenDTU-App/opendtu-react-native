import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Button, Portal, Text, useTheme } from 'react-native-paper';

import { removeDatabaseConfig, updateDatabaseConfig } from '@/slices/settings';

import type { DatabaseConfig } from '@/types/settings';

import StyledModal from '@/components/styled/StyledModal';
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
      setDbType(dbConfig.databaseType);
      setBaseUrl(dbConfig.baseUrl);
      setName(dbConfig.name);
      setUsername(dbConfig.username);
      setPassword(dbConfig.password);
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
      <StyledModal
        {...props}
        contentContainerStyle={{
          backgroundColor: theme.colors.surface,
          padding: 8,
          borderRadius: 24,
          margin: 8,
        }}
      >
        <Box p={16}>
          <Box mb={8}>
            <Text variant="bodyLarge">
              {t('settings.manageDatabase', { name: dbConfig?.name })}
            </Text>
          </Box>
          <Box mb={4}>
            <StyledTextInput
              label={t('database.name')}
              mode="outlined"
              value={name}
              onChangeText={setName}
            />
          </Box>
          <Box mb={4}>
            <StyledTextInput
              label={t('database.baseUrl')}
              mode="outlined"
              value={baseUrl}
              onChangeText={setBaseUrl}
              placeholder={baseUrlPlaceholder}
            />
          </Box>
          <Box mb={4}>
            <StyledTextInput
              label={t('database.username')}
              mode="outlined"
              value={username}
              onChangeText={setUsername}
            />
          </Box>
          <Box mb={4}>
            <StyledTextInput
              label={t('database.password')}
              mode="outlined"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </Box>
        </Box>
        <Box
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: 8,
          }}
        >
          <Button
            mode="text"
            onPress={handleDeleteDatabase}
            style={{ marginRight: 8 }}
            textColor={theme.colors.error}
          >
            {t('delete')}
          </Button>
          <Button mode="text" onPress={handleAbort} style={{ marginRight: 8 }}>
            {t('cancel')}
          </Button>
          <Button mode="text" onPress={handleEditDatabase} disabled={!valid}>
            {t('save')}
          </Button>
        </Box>
      </StyledModal>
    </Portal>
  );
};

export default ManageDatabaseModal;
