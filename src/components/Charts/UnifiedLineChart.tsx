import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { processColor, TouchableOpacity, View } from 'react-native';
import type { LineChartProps } from 'react-native-charts-wrapper';
import { LineChart } from 'react-native-charts-wrapper';
import { Box } from 'react-native-flex-layout';
import { Text, useTheme } from 'react-native-paper';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import StyledSurface from '@/components/styled/StyledSurface';

import useOrientation from '@/hooks/useOrientation';

import { GrafanaColors, GrafanaTextColors } from '@/database';

export interface UnifiedLineChartProps {
  yAxisOverride?: LineChartProps['yAxis'];
  xAxisOverride?: LineChartProps['xAxis'];
  data?: LineChartProps['data'];
  title?: string;
  unit?: string;
}

const HEIGHT = 300;

const UnifiedLineChart: FC<UnifiedLineChartProps> = props => {
  const { xAxisOverride, yAxisOverride, data, title, unit } = props;
  const theme = useTheme();
  const { t } = useTranslation();

  const { height: screenHeight } = useOrientation();

  const [selectedLineIndexes, setSelectedLineIndexes] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  const [markerColor, setMarkerColor] = useState<string | null>(null);
  const [markerTextColor, setMarkerTextColor] = useState<string | null>(null);

  const [minValuePerDataSet, setMinValuePerDataSet] = useState<number[]>([]);
  const [maxValuePerDataSet, setMaxValuePerDataSet] = useState<number[]>([]);
  const [avgValuePerDataSet, setAvgValuePerDataSet] = useState<number[]>([]);

  const [height, setHeight] = useState<number>(HEIGHT);

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
      {title ? (
        <Text
          style={{
            color: theme.colors.onBackground,
            marginTop: 10,
            marginLeft: 4,
          }}
          variant="titleMedium"
        >
          {title}
        </Text>
      ) : null}
      <View style={{ gap: 5 }}>
        <LineChart
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
            granularityEnabled: true,
            granularity: 1,
            labelRotationAngle: 45,
            valueFormatter: 'date',
            valueFormatterPattern: 'HH:mm',
          }}
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
