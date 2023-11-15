import type { FC } from 'react';
import type { TextProps } from 'react-native-paper';
import { Text, useTheme } from 'react-native-paper';

import type { ValueObject } from '@/types/opendtu/status';

export interface OpenDTUValueProps {
  statusValue?: ValueObject;
  textWhenInvalid?: string;
  textProps?: Omit<TextProps<unknown>, 'children'>;
}

const OpenDTUValue: FC<OpenDTUValueProps> = ({
  statusValue,
  textWhenInvalid,
  textProps,
}) => {
  const { v: value, d: decimals, u: unit } = statusValue ?? {};
  const theme = useTheme();

  const valid =
    value !== undefined && decimals !== undefined && unit !== undefined;

  return (
    <Text
      variant="bodyLarge"
      style={{ color: theme.dark ? 'rgb(200,200,200)' : 'rgb(70,70,70)' }}
      {...textProps}
    >
      {valid ? `${value.toFixed(decimals)} ${unit}` : textWhenInvalid ?? ''}
    </Text>
  );
};

export default OpenDTUValue;
