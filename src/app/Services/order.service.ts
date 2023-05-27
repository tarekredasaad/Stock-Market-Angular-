import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { order } from '../Models/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) { }

  createOrder(form:any){
    return this.http.post(`http://localhost:5092/api/Order/AddOrder`,form)
    .pipe(catchError((err: { message: any; }) => {
      return throwError(() => err.message || "server error");
    }));
  }

  GetOrders(): Observable<order[]> {
    return this.http.get<order[]>(`http://localhost:5092/api/Order/GetOrders`)
      .pipe(catchError((err: { message: any; }) => {
        return throwError(() => err.message || "server error");
      }));
  }

}
