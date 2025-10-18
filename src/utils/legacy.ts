import { compare } from 'compare-versions';

import { LegacyLimitType, LimitType } from '@/types/opendtu/control';

import type { OpenDtuFirmwareVersion } from '@/constants';

const legacyToNewlimitTypeMap = {
  [LegacyLimitType.TemporaryAbsolute]: LimitType.AbsolutNonPersistent,
  [LegacyLimitType.TemporaryRelative]: LimitType.RelativNonPersistent,
  [LegacyLimitType.PermanentAbsolute]: LimitType.AbsolutPersistent,
  [LegacyLimitType.PermanentRelative]: LimitType.RelativPersistent,
} as const;

const newToLegacyLimitTypeMap = {
  [LimitType.AbsolutNonPersistent]: LegacyLimitType.TemporaryAbsolute,
  [LimitType.RelativNonPersistent]: LegacyLimitType.TemporaryRelative,
  [LimitType.AbsolutPersistent]: LegacyLimitType.PermanentAbsolute,
  [LimitType.RelativPersistent]: LegacyLimitType.PermanentRelative,
  [LimitType.PowerLimitControl_Max]: LegacyLimitType.TemporaryAbsolute,
} as const;

export const getCorrectLimitType = (
  limitTypeFromApi: LimitType | LegacyLimitType,
  firmwareVersion: OpenDtuFirmwareVersion,
): LimitType => {
  // if firmware version is >= v25.9.11, directly return the limit type from API. if not, map the legacy limit type to the new limit type
  if (
    compare(firmwareVersion, 'v25.9.11', '>=') // featureFlags.apiLimitConfigEnumChange
  ) {
    return limitTypeFromApi as LimitType;
  }

  return legacyToNewlimitTypeMap[
    limitTypeFromApi as LegacyLimitType
  ] as LimitType;
};

export const convertLimitTypeToCorrectEnum = (
  limitType: LegacyLimitType,
  firmwareVersion: OpenDtuFirmwareVersion,
): LimitType | LegacyLimitType => {
  // if firmware version is >= v25.9.11, directly return the limit type. if not, map the new limit type to the legacy limit type

  if (
    compare(firmwareVersion, 'v25.9.11', '>=') // featureFlags.apiLimitConfigEnumChange
  ) {
    return newToLegacyLimitTypeMap[
      limitType as unknown as LimitType
    ] as LegacyLimitType;
  }

  return limitType;
};
