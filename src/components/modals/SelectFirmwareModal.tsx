import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Button, Divider, Portal, RadioButton, Text } from 'react-native-paper';

import { ScrollView } from 'react-native';

import prettyBytes from 'pretty-bytes';

import BaseModal from '@/components/BaseModal';
import InstallAssetModal from '@/components/modals/InstallAssetModal';

import type { Release, ReleaseAsset } from '@octokit/webhooks-types';

export interface SelectFirmwareModalProps extends Omit<ModalProps, 'children'> {
  release: Release | null;
}

const SelectFirmwareModal: FC<SelectFirmwareModalProps> = ({
  release,
  ...props
}) => {
  const { onDismiss } = props;
  const { t } = useTranslation();

  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [installAsset, setInstallAsset] = useState<ReleaseAsset | null>(null);

  const handleAbort = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const handleDownload = useCallback(() => {
    const asset = release?.assets.find(
      asset => asset.id.toString() === selectedAsset,
    );

    if (!asset) {
      return;
    }

    setInstallAsset(asset);
  }, [release?.assets, selectedAsset]);

  const handleDismissInstallModal = useCallback(() => {
    setInstallAsset(null);
  }, []);

  const hasSelectedAsset = useMemo(
    () => release?.assets.some(asset => asset.id.toString() === selectedAsset),
    [release?.assets, selectedAsset],
  );

  const mainModalVisible = useMemo(
    () => props.visible && installAsset === null,
    [props.visible, installAsset],
  );

  const calculatedFirmwareSize = useMemo(() => {
    const bytes =
      release?.assets.find(asset => asset.id.toString() === selectedAsset)
        ?.size || 0;

    return prettyBytes(bytes);
  }, [release?.assets, selectedAsset]);

  return (
    <>
      <Portal>
        <BaseModal
          {...props}
          visible={mainModalVisible}
          legacy
          title=""
          dismissButton={false}
          onDismiss={handleAbort}
        >
          <Box style={{ maxHeight: '100%' }}>
            <Box mb={8}>
              <Text variant="headlineSmall">
                {t('firmwares.installFirmware', { name: release?.name })}
              </Text>
            </Box>
            <ScrollView>
              <RadioButton.Group
                onValueChange={setSelectedAsset}
                value={selectedAsset}
              >
                {release?.assets.map(asset => (
                  <RadioButton.Item
                    key={asset.id}
                    value={asset.id.toString()}
                    label={asset.label || asset.name}
                    labelVariant="labelLarge"
                    style={{ paddingLeft: 0 }}
                  />
                ))}
              </RadioButton.Group>
            </ScrollView>
            <Divider />
            <Box
              mt={4}
              p={4}
              style={{
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <Button onPress={handleAbort}>{t('cancel')}</Button>
              <Button
                mode="contained"
                onPress={handleDownload}
                disabled={!hasSelectedAsset}
              >
                {t('firmwares.download_with_size', {
                  size: calculatedFirmwareSize,
                })}
              </Button>
            </Box>
          </Box>
        </BaseModal>
      </Portal>
      <InstallAssetModal
        asset={installAsset}
        version={release?.tag_name || null}
        visible={installAsset !== null}
        onDismiss={handleDismissInstallModal}
        closeAll={handleAbort}
      />
    </>
  );
};

export default SelectFirmwareModal;
