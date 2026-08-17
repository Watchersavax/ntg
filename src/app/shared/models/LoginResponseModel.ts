import { Loginresponseutil } from './Loginresponseutil';

export class LoginResponseModel {
  statusCode: string;
  success: boolean;
  total: string;
  data: Loginresponseutil;
  error;
}