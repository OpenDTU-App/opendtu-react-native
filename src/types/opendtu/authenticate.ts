export interface OpenDTUAuthenticateResponse {
  authdata?: string;
  code: number;
  message: string;
  type: string | 'success';
}
