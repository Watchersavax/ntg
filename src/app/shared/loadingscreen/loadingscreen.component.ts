import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { LoadingscreenService } from '../../services/loadingscreen.service';

@Component({
  selector: 'app-loadingscreen',
  templateUrl: './loadingscreen.component.html',
  styleUrls: ['./loadingscreen.component.css']
})
export class LoadingscreenComponent implements OnInit,OnDestroy {

  loading: boolean = false;
  loadingSubscription: Subscription;
  i = 0;

  constructor(private loadingScreenService: LoadingscreenService,private cd:ChangeDetectorRef) {

  }

  ngOnInit() {
    this.loadingSubscription = this.loadingScreenService.loadingStatus.subscribe((value:boolean) => {
      this.loading = value;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() {
  }

  getLoading(){

    return this.loading;
  }
}
