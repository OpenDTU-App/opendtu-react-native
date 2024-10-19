import type { TFunction } from 'i18next';

export const validateMinMaxString = (
  t: TFunction,
  value: string,
  min: number = 3,
  max: number = 32,
): boolean => {
  if (value.length > max) {
    throw new Error(t('errors.maxLength', { n: max }));
  }

  if (value.length < min) {
    throw new Error(t('errors.minLength', { n: min }));
  }

  if (value.trim() !== value) {
    throw new Error(t('errors.noLeadingOrTrailingSpaces'));
  }

  return true;
};

export const validateIntNumber = (
  t: TFunction,
  value: string,
  min: number = 0,
  max: number = 100,
): boolean => {
  if (value.length > 0 && !/^\d+$/.test(value)) {
    throw new Error(t('errors.invalidNumber'));
  }

  if (value.length > 0 && parseInt(value) < min) {
    throw new Error(t('errors.invalidNumber'));
  }

  if (value.length > 0 && parseInt(value) > max) {
    throw new Error(t('errors.invalidNumber'));
  }

  return true;
};

export const validateFloatNumber = (
  t: TFunction,
  value: string,
  min: number = 0,
  max: number = 100,
): boolean => {
  if (value.length > 0 && !/^\d+(\.\d+)?$/.test(value)) {
    throw new Error(t('errors.invalidNumber'));
  }

  if (value.length > 0 && parseFloat(value) < min) {
    throw new Error(t('errors.invalidNumber'));
  }

  if (value.length > 0 && parseFloat(value) > max) {
    throw new Error(t('errors.invalidNumber'));
  }

  return true;
};
