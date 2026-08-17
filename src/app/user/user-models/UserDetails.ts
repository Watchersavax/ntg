import { State } from './State';
import { City } from './City';

export class UserDetails {
  userId;
  userName;
  displayName;
  remember;
  authenticationToken;
  firstName;
  lastName;
  cooperateName: string;
  contact;
  address;
  country;
  state: State;
  city: City;
  cityName: string;
  pincode;
  corporateInfo;
  isCorporate;
  courtId;
  courtName;
  roleId;
  roleName;
  profilePic: string;
  isPhoneVerified: boolean;
}
