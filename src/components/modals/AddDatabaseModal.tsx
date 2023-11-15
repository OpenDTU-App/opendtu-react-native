import { v4 as uuidv4 } from 'uuid';

import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Button, Portal, Text, useTheme } from 'react-native-paper';

import { addDatabaseConfig } from '@/slices/settings';

import type { DatabaseConfig } from '@/types/settings';

import StyledModal from '@/components/styled/StyledModal';
import StyledTextInput from '@/components/styled/StyledTextInput';

import { DatabaseType } from '@/database';
import { useAppDispatch } from '@/store';

export type AddDatabaseModalProps = Omit<ModalProps, 'children'>;

const AddDatabaseModal: FC<AddDatabaseModalProps> = props => {
  const { onDismiss } = props;
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [dbType] = useState<DatabaseType>(DatabaseType.Prometheus);
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleAbort = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const handleAddDatabase = useCallback(() => {
    const config = {
      name,
      databaseType: dbType,
      baseUrl,
      username,
      password,
      uuid: uuidv4(),
    } as DatabaseConfig;

    console.log('new DB config', config);

    dispatch(addDatabaseConfig({ config }));
    onDismiss?.();
  }, [baseUrl, dbType, dispatch, name, onDismiss, password, username]);

  const baseUrlPlaceholder = useMemo(() => {
    // Also edit in ManageDatabaseModal.tsx
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
          backgroundColor: theme.colors.elevation.level3,
          padding: 8,
          borderRadius: 28,
          margin: 8,
        }}
      >
        <Box p={16}>
          <Box mb={8}>
            <Text variant="bodyLarge">{t('database.addANewDatabase')}</Text>
          </Box>
          <Box mb={4}>
            <StyledTextInput
              label={t('database.name')}
              mode="outlined"
              value={name}
              onChangeText={setName}
              style={{ backgroundColor: theme.colors.elevation.level3 }}
            />
          </Box>
          <Box mb={4}>
            <StyledTextInput
              label={t('database.baseUrl')}
              mode="outlined"
              value={baseUrl}
              onChangeText={setBaseUrl}
              placeholder={baseUrlPlaceholder}
              style={{ backgroundColor: theme.colors.elevation.level3 }}
            />
          </Box>
          <Box mb={4}>
            <StyledTextInput
              label={t('database.username')}
              mode="outlined"
              value={username}
              onChangeText={setUsername}
              style={{ backgroundColor: theme.colors.elevation.level3 }}
            />
          </Box>
          <Box mb={4}>
            <StyledTextInput
              label={t('database.password')}
              mode="outlined"
              value={password}
              onChangeText={setPassword}
              style={{ backgroundColor: theme.colors.elevation.level3 }}
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
          <Button mode="text" onPress={handleAbort} style={{ marginRight: 8 }}>
            {t('cancel')}
          </Button>
          <Button mode="text" onPress={handleAddDatabase} disabled={!valid}>
            {t('add')}
          </Button>
        </Box>
      </StyledModal>
    </Portal>
  );
};

export default AddDatabaseModal;
