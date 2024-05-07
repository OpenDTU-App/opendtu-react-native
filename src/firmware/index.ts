import type { UploadResult } from 'react-native-fs';
import RNFS from 'react-native-fs';
import { rootLogger } from '@/utils/log.ts';

// implement functions to download the firmware to storage.

const log = rootLogger.extend('FirmwareUtils');

// check if ios
const base = RNFS.TemporaryDirectoryPath;

export const downloadFirmware = async (
  version: string,
  downloadUrl: string,
  onProgress: (progress: number) => void,
): Promise<string | null> => {
  const path = `${base}/${version}.bin`;

  try {
    const response = RNFS.downloadFile({
      fromUrl: downloadUrl,
      toFile: path,
      background: true,
      progressDivider: 1,
      progressInterval: 1000,
      progress: response => {
        if (response.bytesWritten && response.contentLength) {
          onProgress(response.bytesWritten / response.contentLength);
        }
      },
    });

    const result = await response.promise;

    onProgress(1);

    if (result.statusCode !== 200) {
      throw new Error(`HTTP error: ${result.statusCode}`);
    }

    return path;
  } catch (error) {
    log.error('Error downloading firmware', error);
  }

  return null;
};

export const uploadFirmware = async (
  version: string,
  path: string,
  toUrl: string,
  headers: Record<string, string>,
  onProgress: (progress: number) => void,
): Promise<UploadResult | null> => {
  try {
    const md5 = await RNFS.hash(path, 'md5');

    const response = RNFS.uploadFiles({
      toUrl,
      files: [
        {
          name: 'firmware',
          filename: `${version}.bin`,
          filepath: path,
          filetype: 'application/octet-stream',
        },
      ],
      fields: {
        MD5: md5,
      },
      headers,
      begin: response => {
        log.info('upload begin', response);
      },
      method: 'POST',
      progress: response => {
        if (response.totalBytesSent && response.totalBytesExpectedToSend) {
          onProgress(
            response.totalBytesSent / response.totalBytesExpectedToSend,
          );
        }
      },
    });

    const result = await response.promise;

    log.info('upload result', result);

    onProgress(1);

    if (result.statusCode !== 200) {
      throw new Error(`HTTP error: ${result.statusCode}`);
    }

    return result;
  } catch (error) {
    log.error('Error uploading firmware', error);
  }

  return null;
};
