import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { order } from '../Models/order';
import { Stock } from '../Models/stock';
import { StockService } from '../Services/stock.service';
import { OrderService } from '../Services/order.service';
import { HubConnection,HubConnectionBuilder } from '@aspnet/signalr';
import * as signalR from '@aspnet/signalr';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit{

  


  constructor(private fb: FormBuilder,
    private orderService:OrderService,
    private StockService:StockService
   ) {
    this.createForm();
  }
  private hubConnectionBuilder!: HubConnection;
  private hubConnectionBuilderForUpdatePrice!: HubConnection;
  myForm!: FormGroup ;
  Stocks: Stock[] = [];
  Orders:order[] =[]
  orderData:any
  objDto:any
  inputPrice!:any
  stockName!:string
  TotalAmountPayment!:number
  currentPage = 1; 
  itemsPerPage = 5;
  
  Error :any
  order:order ={
    stockID:  0,
    price:0 ,
    personName: '',
    quantity:0 ,
    stock: {
      id:0,
      name:"",
      price:0
    }
  }

 async ngOnInit(){
 
    this.getStocksEveryTwoSecond()
    this.showOrders()
   
  this.StartHubConnection()

  this.StartHubConnectionForChangeprice()
  this.InvokeHubAndUpdatePrice()
    
 this.openHubToListenAnyChangeInPrice()

  this.openHubToListenAnyNewOrderCreatedImmediatlyWithoutRefresh()
    
    
}

  openHubToListenAnyNewOrderCreatedImmediatlyWithoutRefresh(){
    this.hubConnectionBuilder.on('OrderAdded', (
      data: any,price:any,quantity:any,stockName:any) => {
      this.orderData = data;
   
      var tablebody = document.getElementById("tbody");
      
      var row = document.createElement('tr');
      var rowDataOne = document.createElement('td');
      var rowDataOneText = document.createTextNode(`${data}`);
      rowDataOne.append(rowDataOneText)
      var rowDataTwo = document.createElement('td');
      var rowDataTwoText = document.createTextNode(`${stockName}`);
      rowDataTwo.append(rowDataTwoText)
      var rowDataThree = document.createElement('td');
      var rowDataThreeText = document.createTextNode(`${price}`);
      rowDataThree.append(rowDataThreeText)
      var rowDataFour = document.createElement('td');
      var rowDataFourText = document.createTextNode(`${quantity}`);
      rowDataFour.append(rowDataFourText)

      row.append(rowDataOne);
      row.append(rowDataTwo);
      row.append(rowDataThree);
      row.append(rowDataFour);
      row.className='bg-success'
      
      tablebody!.prepend(row);//+=`<tr class="bg-success">
      
    })
  }
  StartHubConnectionForChangeprice(){
    this.hubConnectionBuilderForUpdatePrice =
     new signalR.HubConnectionBuilder()
    .withUrl('http://localhost:5092/RandomNumber',
       {
         skipNegotiation: true,
         transport: signalR.HttpTransportType.WebSockets
       }).configureLogging(signalR.LogLevel.Debug).build();
       
       setTimeout(() => {
         this.hubConnectionBuilderForUpdatePrice.start().then(() => {
           console.log("connection started");
         }).catch(err => console.log(err));
       }, 1000);
  }

  InvokeHubAndUpdatePrice(){
    setInterval( async ()=>{
     

      await  this.hubConnectionBuilderForUpdatePrice
      .invoke('sendRandomNumber')
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

      },2000)
  }

  openHubToListenAnyChangeInPrice(){
    this.hubConnectionBuilder.on('Price', (newPrice) => {
      console.log(newPrice);
      
      this.inputPrice = newPrice
    })
    
  }

  StartHubConnection(){
    this.hubConnectionBuilder = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5092/OrderHub',
        {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        }).configureLogging(signalR.LogLevel.Debug).build();

      setTimeout(async () => {

        
        this.hubConnectionBuilder.start().then(() => {
          console.log("connection started");
        }).catch(err => console.log(err));
      }, 1000);
  }

  getStocksEveryTwoSecond(){
    setInterval(async ()=>{
        
      this.StockService.GetStocks().subscribe({
        next: data => this.Stocks = data,
        error: err => this.Error = err,
      })
    },2000)
  }

  getCeil(num: number): number {
    return Math.ceil(num);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get pages() {
    const pageCount = Math.ceil(this.Orders.length / 5); 
    // Change 10 to the number of items per page
    return Array(pageCount).fill(0).map((_, i) => i + 1);
  }

  getOrdersForPage() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.Orders.slice(startIndex, endIndex);
  }

  setPage(page: number) {
    this.currentPage = page;
  }

  get totalPages() {
    return Math.ceil(this.Orders.length / 5);
     // Change 10 to the number of items per page
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }


  createForm() {
    this.myForm = this.fb.group({
      personName: ['', [Validators.required,
        Validators.minLength(3)
        ,Validators.maxLength(15)]],
      stockID: [null, Validators.required],
      price: [null, Validators.required],
      quantity: ['', [Validators.required,
         Validators.pattern('^[0-9]*$'),
         Validators.min(1)]]
    });
  }


  get personName() {
    return this.myForm.get('personName');
  }

  get quantity() {
    return this.myForm.get('quantity');
  }

  onSelectToChangePrice(){
    console.log(this.order.stockID)
    for(let i=0;i<this.Stocks.length;i++){
      if(this.Stocks[i].id == this.order.stockID){
        this.inputPrice = this.Stocks[i].price
        this.stockName = this.Stocks[i].name
        
      }

    }
    setInterval( async ()=>{
      await  this.hubConnectionBuilder
      .invoke('NewPrice',this.order.stockID )
        console.log("after invoke con here")
        const self = this;
  
      },2000)
    
  }
  
  totalAmount(){
    this.TotalAmountPayment = this.inputPrice * this.order.quantity
  }

 

async  onSubmit() {
    // Handle form submission here
    console.log(this.myForm.value);
    this.objDto = this.myForm.value
    this.orderService.createOrder(this.myForm.value).subscribe({
      next: data => console.log(data),
      error: err => console.log(err),
    })

    setTimeout( async ()=>{
      
      let Price = String(this.inputPrice);
      let Quantity = String(this.objDto.quantity);
     

    await  this.hubConnectionBuilder
    .invoke('NewOrder',this.objDto.personName,
    Price,Quantity,this.stockName)
      console.log("after invoke con here")
      const self = this;

    },2000)
   
   

  }

 
  showOrders(): void {
    this.orderService.GetOrders().subscribe({
      next: data => this.Orders = data,
      error: err => this.Error = err,
    })
    console.log(this.Orders)
  }

  

}
