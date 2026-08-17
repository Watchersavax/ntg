import { Component, OnInit } from '@angular/core';
import { UserdataService } from 'src/app/user/userservices/userdata.service';
import { UserDetails } from 'src/app/user/user-models/UserDetails';
import { State } from 'src/app/user/user-models/State';
import { City } from 'src/app/user/user-models/City';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserdetailsService } from 'src/app/user/userservices/userdetails.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-court-personal-details',
  templateUrl: './court-personal-details.component.html',
  styleUrls: ['./court-personal-details.component.css']
})
export class CourtPersonalDetailsComponent implements OnInit {

  userdetails = new UserDetails();
  statelist:State[] = [];
  citylist:City[] = [];
  detailsupdateform :FormGroup;
  hide = true;
  errorflag:boolean = false;
  errormessage:string = "";

  constructor(private userdataservice:UserdataService,private userdetailsservice:UserdetailsService,private router:Router) { 
    
    //first check for type of user whether its state admin or its court registrar and load details acc to it 
    if(!!localStorage.getItem("userdata") 
      && (JSON.parse(localStorage.getItem("userdata"))["roleId"] == 3 || JSON.parse(localStorage.getItem("userdata"))["roleId"] == 4  )
      && localStorage.getItem("isAdmin") == "false"){

    }else{
      
      this.router.navigate(['login']);
    }

    this.detailsupdateform = new FormGroup({
      firstName: new FormControl( Validators.required),
      lastName: new FormControl( Validators.required),
      address: new FormControl( Validators.required),
      // // country: new FormControl(),
      contact: new FormControl([ Validators.required]),
    });

  }

  ngOnInit() {
    let userid:number = JSON.parse(localStorage.getItem("userdata"))["userId"];
    this.userdetailsservice.fetchUserDetails(userid).subscribe(data=>{
      
      if(data["success"]=== true){
      this.userdetails = data["data"];
      
      //fetch list of states from database 
      //fetch list of states from database

    }

    },() =>{
      
    })

  }

  toggleOptionsSection(){
      
      this.userdetailsservice.fetchCityList(this.detailsupdateform.controls["state"].value).subscribe(data=>{
        
        if(data["success"] === true){
          this.citylist = data["data"];
        }
      },() =>{
        
      })
  }

  toggleCitySelection(){
    
    let cityidofselectedcity = this.detailsupdateform.controls["city"].value;
    this.citylist.forEach(city=>{
      if(city.cityId === cityidofselectedcity){
        this.userdetails.pincode = city.pincode;
      }
    })
  }
  keyPress(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {    
        // invalid character, prevent input
        event.preventDefault();
    }
}
  toggle(){
    this.errorflag = !this.errorflag;
  }

  onSubmit(){
    
    if(this.detailsupdateform.status === "INVALID")
      return ;

    this.userdetails.firstName = this.detailsupdateform.controls["firstName"].value;
    this.userdetails.lastName = this.detailsupdateform.controls["lastName"].value;
    this.userdetails.address = this.detailsupdateform.controls["address"].value;
    this.userdetails.contact = this.detailsupdateform.controls["contact"].value;

    this.userdetailsservice.updateUserDetails(this.userdetails).subscribe(data=>{
      
      if(data["success"] === true){
        this.userdetails = data["data"];
        
        let localstorageuserobj = JSON.parse(localStorage.getItem("userdata"));
        localstorageuserobj.city = this.userdetails.city;
        localstorageuserobj.address = this.userdetails.contact;
        localstorageuserobj.firstName = this.userdetails.firstName;
        localstorageuserobj.lastName = this.userdetails.lastName;
        localstorageuserobj.contact = this.userdetails.contact;
        localstorageuserobj.state = this.userdetails.state;
        localstorageuserobj.pincode = this.userdetails.pincode;
        localstorageuserobj.displayName = this.userdetails.firstName + " "+this.userdetails.lastName;
        localstorageuserobj.profilePic = this.userdetails.profilePic;

        localStorage.setItem("userdata",JSON.stringify(localstorageuserobj));
      }
    },() =>{

    })
  }

  keyDownFunction(event) {
    if(event.keyCode == 13) {
      event.preventDefault();
      this.onSubmit();
    }
  }
}
