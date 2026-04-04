import type { FC } from 'react';
import { Flex } from 'react-native-flex-layout';
import type { TextProps } from 'react-native-paper';
import { Text } from 'react-native-paper';

import type { ValueObject } from '@/types/opendtu/status';

export interface OpenDTUValueProps {
  statusValue?: ValueObject | null;
  textWhenInvalid?: string;
  textProps?: Omit<TextProps<unknown>, 'children'>;
}

export const getOpenDTUValueText = (
  statusValue?: ValueObject | null | unknown,
  textWhenInvalid?: string,
): [string, string] => {
  if (statusValue === null) {
    return [textWhenInvalid ?? '', ''];
  }

  if (typeof statusValue !== 'object') {
    return [textWhenInvalid ?? '', ''];
  }

  const { v: value, d: decimals, u: unit } = (statusValue ?? {}) as ValueObject;

  const valid =
    value !== undefined && decimals !== undefined && unit !== undefined;

  return valid
    ? [`${value.toFixed(decimals)}`, unit]
    : [textWhenInvalid ?? '', ''];
};

const OpenDTUValue: FC<OpenDTUValueProps> = ({
  statusValue,
  textWhenInvalid,
  textProps,
}) => {
  const [text, unit] = getOpenDTUValueText(statusValue, textWhenInvalid);

  return (
    <Flex inline items="baseline" style={{ gap: 4 }}>
      <Text variant="headlineMedium" {...textProps}>
        {text}
      </Text>
      <Text variant="titleMedium" {...textProps}>
        {unit}
      </Text>
    </Flex>
  );
};

export default OpenDTUValue;
