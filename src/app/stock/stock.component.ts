import { Component,OnDestroy, OnInit,ElementRef, ViewChild } from '@angular/core';
import { Stock } from '../Models/stock';
import { StockService } from '../Services/stock.service';
import { SignalRService } from '../Services/signal-r.service';
import { HubConnection } from '@aspnet/signalr';
import * as signalR from '@aspnet/signalr';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss'],
  template: '<div #myElement></div>'

})
export class StockComponent implements OnInit{

 

  
  constructor(private StockService:StockService,private signalRService:SignalRService){}

  Stocks: Stock[] = []
  NewStocks: Stock[] = []
  indecator=''
  arrow = ''
  arrowColor=''
  Error:any
  price :any
  value!: number
  intervalId: any
  random:any

 private hubConnectionBuilder!: HubConnection;

 async ngOnInit(){

   
   this.hubConnectionBuilder = new signalR.HubConnectionBuilder()
   .withUrl('http://localhost:5092/RandomNumber',
      {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      }).configureLogging(signalR.LogLevel.Debug).build();
      
      setTimeout(() => {
        this.hubConnectionBuilder.start().then(() => {
          console.log("connection started");
        }).catch(err => console.log(err));
      }, 1000);
      
      
      
     
      
      
      this.showStocks()
      

      setInterval(async ()=>{
        
        this.StockService.GetStocks().subscribe({
          next: data => this.NewStocks = data,
          error: err => this.Error = err,
        })
      },6000)
      
      setInterval( async ()=>{
       

        await  this.hubConnectionBuilder.invoke('sendRandomNumber')
          console.log("after invoke con here")
          const self = this;
          for(let i =0;i<this.Stocks.length;i++){
            let id = this.Stocks[i].id
            let price = Math.floor(Math.random() * 100) + 1;
            this.StockService.updateStock(id,price).subscribe({
              next: data => console.log(data) ,
              error: err => console.log(err),
            })
          }

        },4000)
        // this.hubConnectionBuilder.off('OrderAdded');
       
         this.hubConnectionBuilder.on('newRandomNumber', (data: any) => {
          // this.orderData =data
          
          this.random=data
          var randoms = document.getElementsByClassName('random');
          for(let i =0 ;i<randoms.length; i++){
           
            if(this.NewStocks[i].price > this.Stocks[i].price){
              this.indecator = 'bg-success';
              this.arrow ='fa fa-arrow-up'
              this.arrowColor='text-success'
            }else{
              this.arrowColor='text-danger'
              this.arrow ='fa fa-arrow-down'
              this.indecator = 'bg-danger';
              // ${this.arrowColor}
            }
            randoms[i].innerHTML = ` 
             <div class="${this.indecator} " style='font-size : 18;color:white; 
             width: 40px; '>
             
            ${this.NewStocks[i].price}</div> ` ;
          }
          // console.log(this.orderData);
        })


      this.signalRService.generateRandomNumber()

      // this.setInnerText()
    }
  // ngOnDestroy(): void {
  //   // clearInterval(this.intervalId); // clear the interval when the component is destroyed

  // }

 updateValue() {
  this.value = Math.floor(Math.random() * 100) + 1;
}

  showStocks(): void {
    this.StockService.GetStocks().subscribe({
      next: data => this.Stocks = data,
      error: err => this.Error = err,
    })
    console.log(this.Stocks)
  }
}
