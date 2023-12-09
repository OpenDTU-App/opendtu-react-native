import moment from 'moment';

import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, processColor, TouchableOpacity, View } from 'react-native';
import type { LineChartProps } from 'react-native-charts-wrapper';
import { LineChart } from 'react-native-charts-wrapper';
import { Box } from 'react-native-flex-layout';
import { Icon, Text, useTheme } from 'react-native-paper';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import StyledSurface from '@/components/styled/StyledSurface';

import useOrientation from '@/hooks/useOrientation';

import { GrafanaColors, GrafanaTextColors } from '@/database';
import { useAppSelector } from '@/store';

export interface ChartData {
  data?: LineChartProps['data'];
  from?: Date;
  to?: Date;
}

export interface UnifiedLineChartProps {
  title: string;
  yAxisOverride?: LineChartProps['yAxis'];
  xAxisOverride?: LineChartProps['xAxis'];
  chartData?: ChartData;
  error?: string;
  unit?: string;
}

const HEIGHT = 300;

export const UNIX_TS_FIRST_SECOND_OF_2000 = 946684800000; // Fix for non-precise float values on Android

const UnifiedLineChart: FC<UnifiedLineChartProps> = props => {
  const { xAxisOverride, yAxisOverride, chartData, title, unit, error } = props;
  const theme = useTheme();
  const { t } = useTranslation();
  const { data, from, to } = chartData ?? {};

  const { height: screenHeight } = useOrientation();

  const [selectedLineIndexes, setSelectedLineIndexes] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  const [markerColor, setMarkerColor] = useState<string | null>(null);
  const [markerTextColor, setMarkerTextColor] = useState<string | null>(null);

  const [minValuePerDataSet, setMinValuePerDataSet] = useState<number[]>([]);
  const [maxValuePerDataSet, setMaxValuePerDataSet] = useState<number[]>([]);
  const [avgValuePerDataSet, setAvgValuePerDataSet] = useState<number[]>([]);

  const [height, setHeight] = useState<number>(HEIGHT);

  const chartRef = useRef<LineChart | null>(null);

  const isRelativeTime = useAppSelector(
    state =>
      state.database.timeRange.end === 'now' &&
      typeof state.database.timeRange.start === 'object',
  );

  useEffect(() => {
    // remove 100px for top and bottom padding
    setHeight(Math.min(screenHeight - 200, HEIGHT));
  }, [screenHeight]);

  const datasetLabels = useMemo(
    () => data?.dataSets?.map(dataset => dataset.label as string),
    [data],
  );

  // apply labels
  useEffect(() => {
    if (typeof datasetLabels === 'undefined') {
      return;
    }

    // check if labels are the same
    if (JSON.stringify(datasetLabels) === JSON.stringify(labels)) {
      return;
    }

    setLabels(datasetLabels);
  }, [datasetLabels, labels]);

  useEffect(() => {
    setSelectedLineIndexes(labels.map((_, index) => index));
  }, [labels]);

  const modifiedData = useMemo(() => {
    if (typeof data === 'undefined') {
      return undefined;
    }

    // filter out datasets that are not selected
    const filteredDataSets = data.dataSets?.filter((_, index) =>
      selectedLineIndexes.includes(index),
    );

    return {
      ...data,
      dataSets: filteredDataSets,
    };
  }, [data, selectedLineIndexes]);

  const labelColors = useMemo(() => {
    if (typeof data === 'undefined' || typeof data.dataSets === 'undefined') {
      return undefined;
    }

    return data.dataSets.map(
      (_, idx) => GrafanaColors[idx % GrafanaColors.length],
    );
  }, [data]);

  const labelTextColors = useMemo(() => {
    if (typeof data === 'undefined' || typeof data.dataSets === 'undefined') {
      return undefined;
    }

    return data.dataSets.map(
      (_, idx) => GrafanaTextColors[idx % GrafanaTextColors.length],
    );
  }, [data]);

  const handleToggleLine = useCallback(
    (index: number) => {
      // remove all markers from chart
      if (chartRef.current) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        chartRef.current.highlights([]);
      }

      setSelectedLineIndexes(
        selectedLineIndexes.includes(index)
          ? selectedLineIndexes.filter(selectedIndex => selectedIndex !== index)
          : [...selectedLineIndexes, index],
      );
    },
    [selectedLineIndexes],
  );

  useEffect(() => {
    if (typeof data === 'undefined' || typeof data.dataSets === 'undefined') {
      return;
    }

    const minValues: number[] = [];
    const maxValues: number[] = [];
    const avgValues: number[] = [];

    data.dataSets.forEach(dataset => {
      const values =
        dataset.values?.map(value =>
          typeof value === 'object' ? value.y : value,
        ) ?? [];

      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((a, b) => a + b) / values.length;

      minValues.push(Math.round(min * 100) / 100);
      maxValues.push(Math.round(max * 100) / 100);
      avgValues.push(Math.round(avg * 100) / 100);
    });

    setMinValuePerDataSet(minValues);
    setMaxValuePerDataSet(maxValues);
    setAvgValuePerDataSet(avgValues);
  }, [data]);

  const timeRangeText = useMemo(() => {
    if (!isRelativeTime) {
      return `${moment(from).format('L HH:mm:ss')} - ${moment(to).format(
        'L HH:mm:ss',
      )}`;
    }

    // last N {seconds, minutes, hours, days, weeks, months, years}
    const diff = moment(to).diff(moment(from), 'seconds');

    if (diff < 60) {
      return t('charts.lastNSeconds', { n: diff });
    }

    if (diff < 60 * 60) {
      return t('charts.lastNMinutes', { n: Math.round(diff / 60) });
    }

    if (diff < 60 * 60 * 24) {
      return t('charts.lastNHours', { n: Math.round(diff / 60 / 60) });
    }

    if (diff < 60 * 60 * 24 * 7) {
      return t('charts.lastNDays', { n: Math.round(diff / 60 / 60 / 24) });
    }
  }, [from, isRelativeTime, t, to]);

  if (error) {
    return (
      <Box>
        <Box
          style={{
            padding: 8,
            borderRadius: 16,
            backgroundColor: theme.colors.errorContainer,
          }}
        >
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onErrorContainer }}
          >
            {title}: {error}
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onErrorContainer }}
          >
            {t('charts.checkDatabase')}
          </Text>
        </Box>
      </Box>
    );
  }

  if (!modifiedData) {
    return (
      <Box m={4}>
        <SkeletonPlaceholder
          backgroundColor={theme.colors.elevation.level1}
          highlightColor={theme.colors.elevation.level3}
          borderRadius={16}
          speed={1000}
        >
          <View style={{ width: '100%', height }} />
        </SkeletonPlaceholder>
      </Box>
    );
  }

  return (
    <StyledSurface style={{ paddingHorizontal: 8 }} elevation={2} mode="flat">
      <Box
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 10,
          marginHorizontal: 4,
        }}
      >
        <Text
          style={{
            color: theme.colors.onBackground,
          }}
          variant="titleMedium"
        >
          {title}
        </Text>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <Icon source="clock-time-eight-outline" size={16} />
          <Text
            style={{ color: theme.colors.onBackground }}
            variant="bodySmall"
          >
            {timeRangeText}
          </Text>
        </Box>
      </Box>
      <View style={{ gap: 5 }}>
        <LineChart
          ref={chartRef}
          data={modifiedData}
          style={{ width: '100%', height }}
          pinchZoom
          doubleTapToZoomEnabled={false}
          drawGridBackground={true}
          gridBackgroundColor={processColor(theme.colors.background)}
          dragEnabled
          marker={{
            enabled: markerColor !== null && markerTextColor !== null,
            markerColor: processColor(markerColor ?? theme.colors.primary),
            textColor: processColor(markerTextColor ?? theme.colors.onPrimary),
          }}
          legend={{ enabled: false }}
          xAxis={{
            ...xAxisOverride,
            textColor: processColor(theme.colors.onBackground),
            textSize: 12,
            gridColor: processColor(
              theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            ),
            drawGridLines: true,
            gridLineWidth: 0.5,
            avoidFirstLastClipping: false,
            position: 'BOTTOM',
            labelRotationAngle: 45,
            valueFormatter: 'date',
            timeUnit: 'MILLISECONDS',
            valueFormatterPattern: 'HH:mm',
            since:
              Platform.OS === 'android'
                ? UNIX_TS_FIRST_SECOND_OF_2000
                : undefined,
            granularityEnabled: true,
            granularity: 1,
          }}
          logEnabled={true}
          yAxis={{
            ...yAxisOverride,
            left: {
              textColor: processColor(theme.colors.onBackground),
              textSize: 12,
              gridColor: processColor(
                theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              ),
              drawGridLines: true,
              gridLineWidth: 0.5,
              granularityEnabled: true,
              granularity: 1,
              ...yAxisOverride?.left,
            },
            right: {
              enabled: false,
              ...yAxisOverride?.right,
            },
          }}
          chartDescription={{
            text: '',
          }}
          onSelect={event => {
            const { data } = event.nativeEvent as unknown as {
              data: {
                index?: number;
              };
            };

            if (typeof data?.index === 'undefined') {
              return;
            }

            setMarkerColor(labelColors?.[data.index] ?? null);
            setMarkerTextColor(labelTextColors?.[data.index] ?? null);
          }}
        />
        <View style={{ marginBottom: 4 }}>
          <Box style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            {labels.map((label, index) => (
              <TouchableOpacity
                key={label}
                onPress={() => handleToggleLine(index)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 5,
                  paddingVertical: 4,
                  gap: 5,
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 12,
                    borderRadius: 5,
                    backgroundColor: labelColors?.[index],
                    opacity: selectedLineIndexes.includes(index) ? 1 : 0.5,
                  }}
                />
                <Text
                  style={{
                    color: labelColors?.[index],
                    opacity: selectedLineIndexes.includes(index) ? 1 : 0.5,
                    fontWeight: '600',
                  }}
                >
                  {label}
                </Text>
                <Text
                  style={{
                    opacity: selectedLineIndexes.includes(index) ? 1 : 0.5,
                    fontSize: 12,
                    color: theme.colors.onBackground,
                    fontWeight: '500',
                  }}
                >
                  {t('charts.minMaxAvg', {
                    min: minValuePerDataSet[index],
                    max: maxValuePerDataSet[index],
                    avg: avgValuePerDataSet[index],
                    unit,
                  })}
                </Text>
              </TouchableOpacity>
            ))}
          </Box>
        </View>
      </View>
    </StyledSurface>
  );
};

export default UnifiedLineChart;
