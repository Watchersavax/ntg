import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';

@Injectable({
  providedIn: 'root'
})
export class NavigationDrawerService {

  navigationDrawer = new Subject<boolean>();
  flag = false;

  constructor() { }

  toggleDrawer(){
    this.flag = !this.flag;
    this.navigationDrawer.next(this.flag);
  }

}

