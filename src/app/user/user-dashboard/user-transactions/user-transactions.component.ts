import { Component, OnInit } from '@angular/core';
import { UserdataService } from '../../userservices/userdata.service';
import { Router } from '@angular/router';
import { TransactionData } from '../../user-models/TransactionData';
import { Sort } from '@angular/material/sort';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-user-transactions',
  templateUrl: './user-transactions.component.html',
  styleUrls: ['./user-transactions.component.css']
})
export class UserTransactionsComponent implements OnInit {

  userid;
  transactiondata:TransactionData[] = [];
  sortedData:TransactionData[] = [];
  httpParams:HttpParams;
  sort = "transactionDate";
  order = "DESC";
  currentpage = 0;
  pagesize = 10;
  activeStatusTab;
  dataMessage = "";
  prevflag = true;
  nextflag = false;

  constructor(private userdataservice:UserdataService,private router:Router) {
    
    if(localStorage.getItem("isAdmin") == "false"){
      
      let userdataobj = JSON.parse(localStorage.getItem("userdata"));
      this.userid = +userdataobj["userId"];
    
    }else{
      this.router.navigate(['/user','login']);
    }

   }

  ngOnInit() {
    this.fetchTransactionList("");
  }

  fetchTransactionList(move){
    this.createHttpParams();
    this.userdataservice.getAllUserTransactions(this.userid,this.httpParams).subscribe(data=>{

      if(data["success"] == true){

        if(data["data"].length == 0){
          this.dataMessage = "*No more data";
          this.disablePaginator(move);
            
        }else{
          this.dataMessage = "";
          this.transactiondata = data["data"];
          this.parseDateString();
        }

      }
    },() =>{
      
    });
  }

  disablePaginator(move){
    
    if(move == "forward"){
      this.nextflag = true;
      this.currentpage--;

    }else if(move == "backward"){
      this.prevflag = true;
      
    }
  }

  parseDateString(){
    for(let i=0;i<this.transactiondata.length;i++){

      let dd = new Date(this.transactiondata[i].transactionDate);
      let datestring = dd.getDate()+"-"+(dd.getMonth()+1)+"-"+dd.getFullYear()+" "+dd.getHours()+":"+dd.getMinutes()+":"+dd.getSeconds();
      this.transactiondata[i].transactionDateString = datestring;
    
    }

  }

  createHttpParams() {
    this.httpParams = new HttpParams()
      .set("page", this.currentpage.toString())
      .set("size", this.pagesize.toString())
      .set("keyword", !!this.activeStatusTab ? this.activeStatusTab : "")
      .set("sort", !!this.sort ? this.sort : "transactionDate")
      .set("order", !!this.order ? this.order : "DESC");
  }

  sortData(sort: Sort) {
    const data = this.transactiondata.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sort = sort.active;
    this.order = (!!sort.direction ? sort.direction.toUpperCase():'DESC');
    this.clearPreviousData();
    this.fetchTransactionList("");
  }

  clearPreviousData(){
    this.currentpage = 0;
  }

  nextPage() {
    if(this.prevflag)
      this.prevflag = false;

    this.currentpage++;
    this.fetchTransactionList("forward");
  }

  previousPage() {

    if(this.nextflag){
      this.nextflag = false;
    }

    if (this.currentpage > 0) {
      this.currentpage--;
      this.fetchTransactionList("backward");
    } else {
      this.dataMessage = "";
    }

    if(this.currentpage == 0){
      this.prevflag = true;
    }
  }

}
