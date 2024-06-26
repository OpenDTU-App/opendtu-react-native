import type { FC } from 'react';
import type { ListItemProps } from 'react-native-paper';
import { List, Surface } from 'react-native-paper';

const StyledListItem: FC<ListItemProps> = props => {
  return (
    <Surface
      mode="flat"
      elevation={props.disabled ? 1 : 3}
      style={{
        borderRadius: 16,
        ...(props.disabled && { opacity: 0.5 }),
      }}
    >
      <List.Item
        {...props}
        borderless
        style={{ paddingVertical: 12, paddingHorizontal: 8, borderRadius: 16 }}
      />
    </Surface>
  );
};

export default StyledListItem;
