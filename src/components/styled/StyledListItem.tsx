import type { ListItemProps } from 'react-native-paper';
import { Surface, List } from 'react-native-paper';
import type { FC } from 'react';

const StyledListItem: FC<ListItemProps> = props => {
  return (
    <Surface elevation={5} style={{ borderRadius: 16 }}>
      <List.Item
        {...props}
        style={{ paddingVertical: 12, paddingHorizontal: 8 }}
      />
    </Surface>
  );
};

export default StyledListItem;
