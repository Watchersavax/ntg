import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';

@Injectable({
  providedIn: 'root'
})
export class UserLoginFlagService {

  loggedInFlag = new Subject<boolean>();

  constructor() { }

  setLoggedInFlag() {
    this.loggedInFlag.next(true);
  }

  setLoggedOffFlag() {
    this.loggedInFlag.next(false);
  }
}
