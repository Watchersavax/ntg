import { UserDetails } from 'src/app/user/user-models/UserDetails';

export class TicketActionDto {
  tiActId: number;

  tiMes: string;

  tiId: number;

  tiActTy: number;

  tiAssTo: number;

  tiAssBy: number;

  tiAssByDe:UserDetails;

  tiAssToDe:UserDetails;

  tiAcDate:Date;

  tiAcDateSt:string;
}
