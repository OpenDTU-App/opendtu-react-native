import type { FC } from 'react';
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
): string => {
  if (statusValue === null) {
    return textWhenInvalid ?? '';
  }

  if (typeof statusValue !== 'object') {
    return textWhenInvalid ?? '';
  }

  const { v: value, d: decimals, u: unit } = (statusValue ?? {}) as ValueObject;

  const valid =
    value !== undefined && decimals !== undefined && unit !== undefined;

  return valid ? `${value.toFixed(decimals)} ${unit}` : textWhenInvalid ?? '';
};

const OpenDTUValue: FC<OpenDTUValueProps> = ({
  statusValue,
  textWhenInvalid,
  textProps,
}) => {
  const text = getOpenDTUValueText(statusValue, textWhenInvalid);

  return (
    <Text variant="bodyLarge" {...textProps}>
      {text}
    </Text>
  );
};

export default OpenDTUValue;
