import { compare } from 'compare-versions';

import useDtuState from '@/hooks/useDtuState';

type CapitalizedString = `${Uppercase<string>}${string}`;

export type FeatureMap = Record<`supports${CapitalizedString}`, boolean>;

export interface Features extends FeatureMap {
  supportsGridProfile: boolean;
  supportsGridProfileRawData: boolean;
}

export type FeatureVersionMap = Record<
  keyof Features,
  `v${number}.${number}.${number}`
>;

export const featureVersionMap: FeatureVersionMap = {
  supportsGridProfile: 'v23.9.11',
  supportsGridProfileRawData: 'v23.12.16',
};

const useFirmwareDependantFeature = (): Record<keyof Features, boolean> => {
  const firmwareVersion = useDtuState(state => state?.systemStatus?.git_hash);

  const featureMap: FeatureMap = Object.fromEntries(
    Object.keys(featureVersionMap).map(feature => [feature, false]),
  );

  if (!firmwareVersion) {
    return featureMap;
  }

  for (const [feature, version] of Object.entries(featureVersionMap)) {
    featureMap[feature as keyof Features] = compare(
      firmwareVersion,
      version,
      '>=',
    );
  }

  return featureMap;
};

export default useFirmwareDependantFeature;
