import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import {
  ActivityIndicator,
  Button,
  Divider,
  HelperText,
  Icon,
  Portal,
  ProgressBar,
  Text,
  useTheme,
} from 'react-native-paper';

import BaseModal from '@/components/BaseModal';

import { rootLogging } from '@/utils/log';

import { useApi } from '@/api/ApiHandler';
import { colors, spacing } from '@/constants';

import type { ReleaseAsset } from '@octokit/webhooks-types';

const log = rootLogging.extend('InstallAssetModal');

export interface InstallFirmwareModalProps
  extends Omit<ModalProps, 'children'> {
  asset: ReleaseAsset | null;
  version: string | null;
  closeAll: () => void;
}

const InstallAssetModal: FC<InstallFirmwareModalProps> = ({
  asset,
  version,
  closeAll,
  ...props
}) => {
  const { onDismiss, visible } = props;
  const { t } = useTranslation();
  const theme = useTheme();

  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [success, setSuccess] = useState<boolean>(false);

  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [installProgress, setInstallProgress] = useState<number>(0);

  const [path, setPath] = useState<string | null>(null);

  const api = useApi();

  const handleDownload = useCallback(async () => {
    if (!asset || !version) {
      log.warn('no asset');
      return;
    }

    log.info('Downloading asset', asset.name);

    setError(null);
    setIsDownloading(true);

    try {
      const path = await api.downloadOTA(
        version,
        asset.browser_download_url,
        progress => {
          log.info('download progress', progress);
          setDownloadProgress(progress);
        },
      );

      setDownloadProgress(1);
      setPath(path);
      setIsDownloading(false);

      log.info('downloaded asset', path);
    } catch (error) {
      log.error('Error downloading asset', error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  }, [api, asset, version]);

  const isDismissible = useMemo(
    () => !isInstalling && !isDownloading,
    [isInstalling, isDownloading],
  );

  const handleAbort = useCallback(
    (skipCheck: boolean = false) => {
      if (!isDismissible && !skipCheck) {
        return;
      }

      setPath(null);
      setError(null);
      setDownloadProgress(0);
      setInstallProgress(0);
      setIsDownloading(false);
      setIsInstalling(false);
      setSuccess(false);

      onDismiss?.();
    },
    [isDismissible, onDismiss],
  );

  const handleInstall = useCallback(async () => {
    if (!path || !version) {
      return;
    }

    setError(null);

    setIsInstalling(true);
    setInstallProgress(0);

    const result = await api.handleOTA(version, path, progress => {
      log.info('install progress', progress);
      setInstallProgress(progress);
    });

    let successful = true;

    if (!result) {
      log.error('Error installing asset');
      setError('An unknown error occurred');
      successful = false;
    }

    setInstallProgress(1);

    try {
      await api.awaitForUpdateFinish(version);

      if (successful) {
        setSuccess(true);

        setTimeout(() => {
          handleAbort(true);
          closeAll();
        }, 1500);
      }

      setIsInstalling(false);
    } catch (error) {
      log.error('Timeout waiting for update to finish', error);
      setError('Timeout waiting for update to finish');
    }
  }, [api, closeAll, handleAbort, path, version]);

  useEffect(() => {
    if (
      visible &&
      asset !== null &&
      path === null &&
      !isDownloading &&
      !isInstalling &&
      installProgress === 0 &&
      downloadProgress === 0 &&
      !success &&
      error === null
    ) {
      handleDownload();
    }
  }, [
    asset,
    path,
    handleDownload,
    isDownloading,
    isInstalling,
    visible,
    success,
    installProgress,
    downloadProgress,
    error,
  ]);

  const showWaitForUpdateFinished = useMemo(() => {
    return isInstalling && installProgress >= 1;
  }, [isInstalling, installProgress]);

  return (
    <>
      <Portal>
        <BaseModal
          {...props}
          dismissable={isDismissible}
          onDismiss={handleAbort}
          dismissableBackButton={isDismissible}
        >
          {success ? (
            <Box p={16} style={{ maxHeight: '100%' }}>
              <Box mb={16} style={{ display: 'flex', alignItems: 'center' }}>
                <Text variant="titleLarge">
                  {t('firmwares.successfullyInstalledTheFirmware')}
                </Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center' }}>
                <Icon source="check-circle" size={100} color={colors.success} />
              </Box>
            </Box>
          ) : !showWaitForUpdateFinished ? (
            <Box pt={16} style={{ maxHeight: '100%' }}>
              <Box mb={8} ph={16}>
                <Text variant="bodyLarge">
                  {t('firmwares.installAsset', { name: asset?.name })}
                </Text>
              </Box>
              <Box ph={16}>
                <Box
                  mb={4}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: spacing,
                    alignItems: 'center',
                  }}
                >
                  <Text>{t('firmwares.downloadProgress')}</Text>
                  <Box style={{ flex: 1 }}>
                    <ProgressBar progress={downloadProgress} />
                  </Box>
                </Box>
                <Box
                  mb={4}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: spacing,
                    alignItems: 'center',
                  }}
                >
                  <Text>{t('firmwares.installProgress')}</Text>
                  <Box style={{ flex: 1 }}>
                    <ProgressBar progress={installProgress} />
                  </Box>
                </Box>
              </Box>
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
              <Divider />
              <Box
                mt={4}
                p={4}
                style={{
                  flexDirection: 'column',
                  gap: spacing,
                }}
              >
                <Button onPress={() => handleAbort()} disabled={!isDismissible}>
                  {t('cancel')}
                </Button>
                <Box ml={8}>
                  <Button
                    mode="contained"
                    onPress={handleInstall}
                    disabled={
                      !path ||
                      downloadProgress < 1 ||
                      isDownloading ||
                      isInstalling
                    }
                    loading={isInstalling || isDownloading}
                  >
                    {isDownloading
                      ? t('firmwares.downloading')
                      : isInstalling
                        ? t('firmwares.installing')
                        : t('firmwares.install')}
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box p={16} style={{ maxHeight: '100%' }}>
              <Box mb={16}>
                <Text variant="bodyLarge">
                  {t('firmwares.waitingForReconnect')}
                </Text>
              </Box>
              {error ? (
                <Box mb={8}>
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.error }}
                  >
                    {error}
                  </Text>
                </Box>
              ) : (
                <Box mb={16}>
                  <ActivityIndicator size="large" />
                </Box>
              )}
              <Box>
                <Button
                  mode="contained"
                  onPress={() => handleAbort(true)}
                  style={{ width: '100%' }}
                  disabled={error === null}
                >
                  {t('cancel')}
                </Button>
              </Box>
            </Box>
          )}
        </BaseModal>
      </Portal>
    </>
  );
};

export default InstallAssetModal;
