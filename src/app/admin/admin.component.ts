import { Component, OnInit } from '@angular/core';
import { Router,Event,NavigationCancel,NavigationEnd,NavigationStart,NavigationError } from '@angular/router';
import { LoadingscreenService } from '../services/loadingscreen.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private route:Router,private loadingservice:LoadingscreenService) { 

    this.route.events.subscribe((routerEvent:Event) => {
      if(routerEvent instanceof NavigationStart){
        this.loadingservice.startLoading();
        
      }

      if(routerEvent instanceof NavigationEnd){
        this.loadingservice.stopLoading();
        
      }

      if(routerEvent instanceof NavigationError){
        this.loadingservice.stopLoading();
        
      }

      if(routerEvent instanceof NavigationCancel){
        this.loadingservice.stopLoading();
        
      }

    });

  }

  ngOnInit() {
  }

}
