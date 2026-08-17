import { Component, OnInit } from '@angular/core';
import { UserDetails } from 'src/app/user/user-models/UserDetails';
import { State } from 'src/app/user/user-models/State';
import { City } from 'src/app/user/user-models/City';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserdetailsService } from 'src/app/user/userservices/userdetails.service';

@Component({
  selector: 'app-admin-personal',
  templateUrl: './admin-personal.component.html',
  styleUrls: ['./admin-personal.component.css']
})
export class AdminPersonalComponent implements OnInit {

  userdetails = new UserDetails();
  statelist: State[] = [];
  citylist: City[] = [];
  detailsupdateform: FormGroup;
  hide = true;
  errorflag: boolean = false;
  errormessage: string = "";

  constructor(private userdetailsservice: UserdetailsService) {

    this.detailsupdateform = new FormGroup({
      firstName: new FormControl(Validators.required),
      lastName: new FormControl(Validators.required),
      address: new FormControl(Validators.required),
      contact: new FormControl([Validators.required]),
      pincode: new FormControl(Validators.required),
      state: new FormControl(Validators.required),
      city: new FormControl(),
      cityName: new FormControl()
    });

  }

  ngOnInit() {
    let userid: number = JSON.parse(localStorage.getItem("admindata"))["userId"];
    this.userdetailsservice.fetchUserDetails(userid).subscribe(data => {
      
      if (data["success"] === true) {
        this.userdetails = data["data"];

        //fetch list of states from database 
        this.userdetailsservice.fetchStateList().subscribe(data1 => {

          if (data1["success"] === true) {
            this.statelist = data1["data"];
            if (this.userdetails.state != undefined && this.userdetails.state != null) {
              this.userdetailsservice.fetchCityList(this.userdetails.state.stateId).subscribe(data => {
                
                if (data["success"] === true) {
                  this.citylist = data["data"];
                }
              }, (error) => {
                console.error('Admin personal: failed to fetch city list for current state', error);
              })
            }
          }

        }, (error) => {
          console.error('Admin personal: failed to fetch state list', error);
        });
      }

    }, (error) => {
      console.error('Admin personal: failed to fetch user details', error);
    })

  }

  toggleOptionsSection() {
    
    this.userdetailsservice.fetchCityList(this.detailsupdateform.controls["state"].value).subscribe(data => {
      
      if (data["success"] === true) {
        this.citylist = data["data"];
      }
    }, (error) => {
      console.error('Admin personal: failed to fetch city list for selected state', error);
    })
  }

  toggleCitySelection() {
    
    let cityidofselectedcity = this.detailsupdateform.controls["city"].value;
    this.citylist.forEach(city => {
      if (city.cityId === cityidofselectedcity) {
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
  toggle() {
    this.errorflag = !this.errorflag;
  }

  onSubmit() {
    
    if (this.detailsupdateform.status === "INVALID")
      return;

    this.userdetails.firstName = this.detailsupdateform.controls["firstName"].value;
    this.userdetails.lastName = this.detailsupdateform.controls["lastName"].value;
    this.userdetails.pincode = this.detailsupdateform.controls["pincode"].value;
    this.userdetails.address = this.detailsupdateform.controls["address"].value;
    this.userdetails.contact = this.detailsupdateform.controls["contact"].value;
    this.statelist.forEach(state => {
      if (state.stateId === this.detailsupdateform.controls["state"].value) {
        this.userdetails.state = state;
      }
    });

    this.citylist.forEach(city => {
      if (city.cityId === this.detailsupdateform.controls["city"].value) {
        this.userdetails.city = city;
      }
    });

    this.userdetailsservice.updateUserDetails(this.userdetails).subscribe(data => {
      
      if (data["success"] === true) {
        this.userdetails = data["data"];

        let localstorageuserobj = JSON.parse(localStorage.getItem("admindata"));
        localstorageuserobj.city = this.userdetails.city;
        localstorageuserobj.address = this.userdetails.contact;
        localstorageuserobj.firstName = this.userdetails.firstName;
        localstorageuserobj.lastName = this.userdetails.lastName;
        localstorageuserobj.contact = this.userdetails.contact;
        localstorageuserobj.state = this.userdetails.state;
        localstorageuserobj.pincode = this.userdetails.pincode;
        localstorageuserobj.displayName = this.userdetails.firstName + " " + this.userdetails.lastName;
        localstorageuserobj.profilePic = this.userdetails.profilePic;

        localStorage.setItem("admindata", JSON.stringify(localstorageuserobj));
      }
    }, (error) => {
      console.error('Admin personal: failed to update user details', error);
    })
  }

  keyDownFunction(event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.onSubmit();
    }
  }
}
