import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Icon, IconButton, Text } from 'react-native-paper';

import {
  setBugreportInfoDismissed,
  setFeedbackInfoDismissed,
} from '@/slices/settings';

import { colors } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store';

const AppInfos: FC = () => {
  const { t } = useTranslation();

  const feedbackInfoDismissed = useAppSelector(
    store => store.settings.feedbackInfoDismissed,
  );
  const bugreportInfoDismissed = useAppSelector(
    store => store.settings.bugreportInfoDismissed,
  );

  const dispatch = useAppDispatch();

  const handleHideFeedbackInfo = () => {
    dispatch(setFeedbackInfoDismissed());
  };

  const handleHideBugreportInfo = () => {
    dispatch(setBugreportInfoDismissed());
  };

  return (
    <>
      {!feedbackInfoDismissed ? (
        <Box
          style={{
            marginHorizontal: 12,
            padding: 8,
            backgroundColor: colors.info,
            borderRadius: 16,
            marginBottom: 8,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Box
            style={{
              display: 'flex',
              flexDirection: 'row',
              flex: 1,
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Box mh={8}>
              <Icon size={24} source="file-document" />
            </Box>
            <Box style={{ flex: 1 }}>
              <Text variant="titleMedium">{t('appInfos.feedback')}</Text>
              <Text style={{ color: colors.onInfo }}>
                {t('appInfos.feedbackDescription')}
              </Text>
            </Box>
          </Box>
          <IconButton icon="close" onPress={handleHideFeedbackInfo} />
        </Box>
      ) : null}
      {!bugreportInfoDismissed ? (
        <Box
          style={{
            marginHorizontal: 12,
            padding: 8,
            backgroundColor: colors.info,
            borderRadius: 16,
            marginBottom: 8,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Box
            style={{
              display: 'flex',
              flexDirection: 'row',
              flex: 1,
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Box mh={8}>
              <Icon size={24} source="bug" />
            </Box>
            <Box style={{ flex: 1 }}>
              <Text variant="titleMedium">{t('appInfos.bugReporting')}</Text>
              <Text style={{ color: colors.onInfo, flex: 1 }}>
                {t('appInfos.bugReportingDescription')}
              </Text>
            </Box>
            <IconButton icon="close" onPress={handleHideBugreportInfo} />
          </Box>
        </Box>
      ) : null}
    </>
  );
};

export default AppInfos;
