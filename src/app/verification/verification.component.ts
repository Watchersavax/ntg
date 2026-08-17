import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css']
})
export class VerificationComponent implements OnInit {

  constructor(private route:ActivatedRoute,private http:HttpClient,private router:Router) { 
    
    let p = this.route.snapshot.queryParams["p"];
    let token = this.route.snapshot.queryParams["token"];
    let roletype = this.route.snapshot.queryParams["type"];
    
    this.http.get(environment.url + "api/auth/verify?p="+p+"&token="+token+"&type="+roletype)
    .subscribe(
      (response) => {
          this.router.navigate(['/user/home']);
      },
      () => {
    	  
    	  alert("Something is not right, we will be back soon!");     
      }
    );
  }

  ngOnInit() {
    
  }

}
