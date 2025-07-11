import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Button, Portal, Text, useTheme } from 'react-native-paper';

import { v4 as uuidv4 } from 'uuid';

import { addDatabaseConfig } from '@/slices/settings';

import type { DatabaseConfig } from '@/types/settings';

import BaseModal from '@/components/BaseModal';
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
      <BaseModal {...props}>
        <Box p={16}>
          <Box mb={8}>
            <Text variant="bodyLarge">{t('database.addANewDatabase')}</Text>
          </Box>
          <Box mb={4}>
            <StyledTextInput
              label={t('database.name')}
              mode="outlined"
              onChangeText={setName}
              style={{ backgroundColor: theme.colors.elevation.level3 }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Box>
          <Box mb={4}>
            <StyledTextInput
              label={t('database.baseUrl')}
              mode="outlined"
              onChangeText={setBaseUrl}
              placeholder={baseUrlPlaceholder}
              style={{ backgroundColor: theme.colors.elevation.level3 }}
              textContentType="URL"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Box>
          <Box mb={4}>
            <StyledTextInput
              label={t('database.username')}
              mode="outlined"
              onChangeText={setUsername}
              style={{ backgroundColor: theme.colors.elevation.level3 }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Box>
          <Box mb={4}>
            <StyledTextInput
              label={t('database.password')}
              mode="outlined"
              onChangeText={setPassword}
              style={{ backgroundColor: theme.colors.elevation.level3 }}
              secureTextEntry
              textContentType="password"
              autoCapitalize="none"
              autoCorrect={false}
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
      </BaseModal>
    </Portal>
  );
};

export default AddDatabaseModal;
