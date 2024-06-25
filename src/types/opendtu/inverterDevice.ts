export interface InverterDeviceData {
  valid_data: boolean;
  fw_bootloader_version: number;
  fw_build_version: number;
  fw_build_datetime: string;
  hw_part_number: number;
  hw_version: number;
  hw_model_name: string;
  max_power: number;
}
