import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

const isPortrait = () => {
  const dim = Dimensions.get('screen');
  return dim.height >= dim.width;
};

export enum Orientation {
  PORTRAIT = 'PORTRAIT',
  LANDSCAPE = 'LANDSCAPE',
}

export interface UseOrientation {
  orientation: Orientation;
  height: number;
  width: number;
}

const useOrientation = (): UseOrientation => {
  // State to hold the connection status
  const [orientation, setOrientation] = useState<Orientation>(
    isPortrait() ? Orientation.PORTRAIT : Orientation.LANDSCAPE,
  );

  const [dimensions, setDimensions] = useState(Dimensions.get('screen'));

  useEffect(() => {
    const callback = () => {
      setOrientation(
        isPortrait() ? Orientation.PORTRAIT : Orientation.LANDSCAPE,
      );
      setDimensions(Dimensions.get('screen'));
    };

    const subscription = Dimensions.addEventListener('change', callback);

    return () => {
      subscription.remove();
    };
  }, []);

  return { orientation, height: dimensions.height, width: dimensions.width };
};

export default useOrientation;
