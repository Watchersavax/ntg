import { HttpInterceptor, HttpResponse, HttpEvent, HttpRequest, HttpErrorResponse } from "@angular/common/http";
import { Loginresponseutil } from '../shared/models/Loginresponseutil';
import { catchError, tap } from 'rxjs/operators';
import { LoadingscreenService } from './loadingscreen.service';
import { Injectable } from "@angular/core";
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from "./auth.service";
import { throwError } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor{
    sessionObject:Loginresponseutil;
    interceptcount =0;
    jwtHelper = new JwtHelperService();

    constructor(private loadingservice:LoadingscreenService,  private authService: AuthService){

    }

    intercept(req: import("@angular/common/http").HttpRequest<any>, next: import("@angular/common/http").HttpHandler): import("rxjs").Observable<import("@angular/common/http").HttpEvent<any>> {
        
        let flagfordocumentdetailfetch = false;

        let patternloginui = req.url.match("api/auth/signin");
        let patternsignup  = req.url.match("api/auth/signup");

        if(!this.excludedUrlsForLoadingScreens(req)){
          this.loadingservice.startLoading();
          this.interceptcount++;
        }else{
          this.loadingservice.stopLoading();
         
        }
        
        //check if admin is logged in or user is logged in
        if(localStorage.getItem("isAdmin") === "true"){

          if(patternsignup!=null || patternloginui!=null  || localStorage.getItem("admindata")=== null ){

          }else{
          
            this.sessionObject=JSON.parse(localStorage.getItem("admindata"));
          
            req = this.addAuthenticationToken(req, this.sessionObject.authenticationToken);
          }

        }else{

          if(patternsignup!=null || patternloginui!=null || localStorage.getItem("userdata") == "" || localStorage.getItem("userdata") == null){

          }else{
          
            this.sessionObject=JSON.parse(localStorage.getItem("userdata"));
          
          req = this.addAuthenticationToken(req, this.sessionObject.authenticationToken);
          }

        }

        return next.handle(req).pipe(
          tap((event: HttpEvent<any>) => { 
            if (event instanceof HttpResponse) {
              this.interceptcount--;
              if (this.interceptcount <= 0) {
                this.loadingservice.stopLoading();
              }
            }
          }),
          catchError((error: HttpErrorResponse) => {
            this.interceptcount = 0;
            this.loadingservice.stopLoading();
            const requestUrl = req.url ? req.url.split('?')[0] : '';
            console.error('HTTP request failed', {
              method: req.method,
              url: requestUrl,
              status: error.status,
              statusText: error.statusText,
              message: error.message
            });
            // Handle token expiration and unauthorized error
            if (error.status === 401) {
              this.authService.logout();
            }
            return throwError(error);
          })
        );
    }

    excludedUrlsForLoadingScreens(req){
      
      if(req.url.match("/getUserAffidavitByAffidavitId") != null){
        return true ;
      }

      if(req.url.match("/getTemplateParagraphCondition/") != null){
        return true;
      }

      if(req.url.match("/getTemplateAttributes/") != null){
        return true;
      }

      if(req.url.match("/getAllCitiesByStateId") !=null){

        return true;
      }

      return false;
    }

 addAuthenticationToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
      if (!token || this.jwtHelper.isTokenExpired(token)) {
        this.authService.logout();
        return req;
      }
      return req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

}
