import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, Button, Divider, Text, useTheme } from 'react-native-paper';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import type { RangeChange } from 'react-native-paper-dates/src/Date/Calendar';

import { setTimeRangeFrom, setTimeRangeTo } from '@/slices/database';

import type {
  DatabaseTimeRangeEnd,
  DatabaseTimeRangeStart,
} from '@/types/database';

import ChangeGraphRefreshIntervalModal from '@/components/modals/ChangeGraphRefreshIntervalModal';
import TimeRangeLastNSecondsModal from '@/components/modals/TimeRangeLastNSecondsModal';
import ShowTimeRange from '@/components/ShowTimeRange';

import { spacing } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store';
import { StyledView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const ConfigureGraphsScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();

  const timeRangeStart = useAppSelector(
    state => state.database.timeRange.start,
  );
  const timeRangeEnd = useAppSelector(state => state.database.timeRange.end);

  const [openDateSelector, setOpenDateSelector] = useState<boolean>(false);

  const [openStartTimeSelector, setOpenStartTimeSelector] =
    useState<boolean>(false);

  const [openEndTimeSelector, setOpenEndTimeSelector] =
    useState<boolean>(false);

  const [openLastNSecondsModal, setOpenLastNSecondsModal] =
    useState<boolean>(false);

  const [startDateState, setStartDateState] = useState<
    DatabaseTimeRangeStart | undefined
  >(timeRangeStart);
  const [endDateState, setEndDateState] = useState<
    DatabaseTimeRangeEnd | undefined
  >(timeRangeEnd);

  const startDateStateDate = useMemo(() => {
    if (startDateState === undefined) return undefined;

    if (startDateState instanceof Date) return startDateState;

    // eslint-disable-next-line react-hooks/purity
    return new Date(Date.now() - startDateState.seconds * 1000);
  }, [startDateState]);

  const endDateStateDate = useMemo(() => {
    if (endDateState === undefined) return undefined;

    if (endDateState === 'now') return new Date();

    return endDateState;
  }, [endDateState]);

  const handleDateConfirm = useCallback<RangeChange>(
    ({ startDate, endDate }) => {
      let startDateStateCopy = startDateState;
      let endDateStateCopy = endDateState;

      if (
        startDate === undefined ||
        endDate === undefined ||
        startDateStateCopy === undefined ||
        endDateStateCopy === undefined
      )
        return;

      setOpenDateSelector(false);

      if (!(startDateStateCopy instanceof Date)) {
        startDateStateCopy = new Date();
      }

      if (!(endDateStateCopy instanceof Date)) {
        endDateStateCopy = new Date();
      }

      // only change Date, leave time as is
      const newStartDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        startDateStateCopy?.getHours() ?? 0,
        startDateStateCopy?.getMinutes() ?? 0,
        startDateStateCopy?.getSeconds() ?? 0,
      );

      const newEndDate = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        endDateStateCopy?.getHours() ?? 0,
        endDateStateCopy?.getMinutes() ?? 0,
        endDateStateCopy?.getSeconds() ?? 0,
      );

      setStartDateState(newStartDate);
      setEndDateState(newEndDate);
    },
    [endDateState, startDateState],
  );

  const handleDateDismiss = useCallback(() => {
    setOpenDateSelector(false);
  }, []);

  const handleStartTimeConfirm = useCallback<
    Parameters<typeof TimePickerModal>[0]['onConfirm']
  >(
    ({ hours, minutes }) => {
      if (startDateState === undefined) return;

      let startDateStateCopy = startDateState;

      setOpenStartTimeSelector(false);

      if (!(startDateStateCopy instanceof Date)) {
        startDateStateCopy = new Date();
      }

      const newStartDate = new Date(
        startDateStateCopy.getFullYear(),
        startDateStateCopy.getMonth(),
        startDateStateCopy.getDate(),
        hours,
        minutes,
        0,
      );

      setStartDateState(newStartDate);
    },
    [startDateState],
  );

  const handleEndTimeConfirm = useCallback<
    Parameters<typeof TimePickerModal>[0]['onConfirm']
  >(
    ({ hours, minutes }) => {
      if (endDateState === undefined) return;

      let endDateStateCopy = endDateState;

      setOpenEndTimeSelector(false);

      if (!(endDateStateCopy instanceof Date)) {
        endDateStateCopy = new Date();
      }

      const newEndDate = new Date(
        endDateStateCopy.getFullYear(),
        endDateStateCopy.getMonth(),
        endDateStateCopy.getDate(),
        hours,
        minutes,
        0,
      );

      setEndDateState(newEndDate);
    },
    [endDateState],
  );

  const handleLastNSecondsConfirm = useCallback((seconds: number) => {
    setOpenLastNSecondsModal(false);

    setEndDateState('now');
    setStartDateState({ seconds });
  }, []);

  const seconds = useMemo(() => {
    if (startDateState === undefined) return undefined;

    if (startDateState instanceof Date) return undefined;

    return startDateState.seconds;
  }, [startDateState]);

  const handleSave = useCallback(() => {
    dispatch(setTimeRangeFrom({ start: startDateState }));
    dispatch(setTimeRangeTo({ end: endDateState }));
  }, [dispatch, startDateState, endDateState]);

  const [
    openChangeGraphRefreshIntervalModal,
    setOpenChangeGraphRefreshIntervalModal,
  ] = useState<boolean>(false);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('configureGraphs.title')} />
      </Appbar.Header>
      <StyledView theme={theme}>
        <Box style={{ width: '100%', flex: 1 }}>
          <Box
            style={{
              borderRadius: theme.roundness * 6,
              padding: 16,
              margin: 8,
              backgroundColor: theme.colors.elevation.level3,
            }}
          >
            <Text variant="titleLarge">
              {t('configureGraphs.changeTimeRange')}
            </Text>
            <ShowTimeRange
              startDateState={startDateState}
              endDateState={endDateState}
            />
            <Divider style={{ marginVertical: 8 }} bold />
            <Box style={{ gap: spacing, paddingVertical: 8 }}>
              <Button onPress={() => setOpenDateSelector(true)}>
                {t('configureGraphs.changeTimeRange')}
              </Button>
              <Button onPress={() => setOpenStartTimeSelector(true)}>
                {t('configureGraphs.changeStartTimestamp')}
              </Button>
              <Button onPress={() => setOpenEndTimeSelector(true)}>
                {t('configureGraphs.changeEndTimestamp')}
              </Button>
              <Button onPress={() => setEndDateState('now')}>
                {t('configureGraphs.setEndToNow')}
              </Button>
              <Button onPress={() => setOpenLastNSecondsModal(true)}>
                {t('configureGraphs.setLastNSeconds')}
              </Button>
              <Button onPress={handleSave} mode="contained">
                {t('configureGraphs.save')}
              </Button>
            </Box>
          </Box>
          <Box
            style={{
              borderRadius: theme.roundness * 6,
              padding: 16,
              margin: 8,
              backgroundColor: theme.colors.elevation.level3,
            }}
          >
            <Text variant="titleLarge">
              {t('configureGraphs.changeRefreshInterval')}
            </Text>
            <Divider style={{ marginVertical: 8 }} bold />
            <Box style={{ gap: spacing, paddingVertical: 8 }}>
              <Button
                mode="contained"
                onPress={() => setOpenChangeGraphRefreshIntervalModal(true)}
              >
                {t('configureGraphs.changeRefreshInterval')}
              </Button>
            </Box>
          </Box>
        </Box>
        <DatePickerModal
          mode="range"
          onConfirm={handleDateConfirm}
          locale={i18n.language}
          startDate={startDateStateDate}
          endDate={endDateStateDate}
          onDismiss={handleDateDismiss}
          visible={openDateSelector}
          label={t('configureGraphs.changeTimeRange')}
        />
        <TimePickerModal
          visible={openStartTimeSelector}
          onDismiss={() => setOpenStartTimeSelector(false)}
          onConfirm={handleStartTimeConfirm}
          hours={startDateStateDate?.getHours() ?? 0}
          minutes={startDateStateDate?.getMinutes() ?? 0}
          locale={i18n.language}
          animationType="slide"
          label={t('configureGraphs.changeStartTimestamp')}
        />
        <TimePickerModal
          visible={openEndTimeSelector}
          onDismiss={() => setOpenEndTimeSelector(false)}
          onConfirm={handleEndTimeConfirm}
          hours={endDateStateDate?.getHours() ?? 0}
          minutes={endDateStateDate?.getMinutes() ?? 0}
          locale={i18n.language}
          animationType="slide"
          label={t('configureGraphs.changeEndTimestamp')}
        />
        <TimeRangeLastNSecondsModal
          onConfirm={handleLastNSecondsConfirm}
          seconds={seconds}
          visible={openLastNSecondsModal}
          onDismiss={() => setOpenLastNSecondsModal(false)}
        />
        <ChangeGraphRefreshIntervalModal
          visible={openChangeGraphRefreshIntervalModal}
          onDismiss={() => setOpenChangeGraphRefreshIntervalModal(false)}
        />
      </StyledView>
    </>
  );
};

export default ConfigureGraphsScreen;
