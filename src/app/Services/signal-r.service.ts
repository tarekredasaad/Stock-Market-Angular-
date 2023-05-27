import { Injectable , Renderer2, RendererFactory2} from '@angular/core';
import * as signalR from '@aspnet/signalr'
// import * as signalR from '@microsoft/signalr'
import { order } from '../Models/order';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  hubconnection!: signalR.HubConnection;
  MyOrder!:order
  constructor(private http: HttpClient) { }
  apiUrl = 'http://localhost:5092/api/Order';
  generateRandomNumber(): Observable<number> {
    return new Observable<number>(observer => {
      this.hubconnection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5092/RandomNumber')
        .build();

      this.hubconnection.on('newRandomNumber', (number: number) => {
        observer.next(number);
        console.log(number)
      });

      this.hubconnection.start().then(() => {
        console.log('SignalR connection started');
      });

      setInterval(() => {
        this.http.get<number>(this.apiUrl).subscribe(number => {
          this.hubconnection.invoke('sendRandomNumber', number);
        });
      }, 10000);
    });
  }

  async StartRandomNumber(){
    this.hubconnection = new signalR.HubConnectionBuilder().withUrl('http://localhost:5092/RandomNumber',
    {
        skipNegotiation : true ,
         transport:signalR.HttpTransportType.WebSockets
    }).configureLogging(signalR.LogLevel.Debug).build();
    await setTimeout(async ()=> {
      this.hubconnection.start().then(()=>{
        console.log("Hello Connection")
      }).catch(err => console.log(err))
      
    },2000)
  }

  

 async StartOrderConnection(){
    this.hubconnection = new signalR.HubConnectionBuilder().withUrl('http://localhost:5092/OrderHub',
    {
        skipNegotiation : true ,
         transport:signalR.HttpTransportType.WebSockets
    }).configureLogging(signalR.LogLevel.Debug).build();
    await setTimeout(async ()=> {
      this.hubconnection.start().then(()=>{
        console.log("Hello Connection")
      }).catch(err => console.log(err))
      
    },2000)
  }
  
  
  async askServer(order:order){
    this.MyOrder = order;
    console.log("before invoke con here")
    this.hubconnection.invoke('NewOrder')
    console.log("after invoke con here")
    const self = this;
    await this.hubconnection.on('OrderAdded', (data) =>{
      console.log("data")
      console.log(data)
    })
  }

}
