import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Stock } from '../Models/stock';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private http: HttpClient) { }

  GetStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`http://localhost:5092/api/Stock`)
      .pipe(catchError((err: { message: any; }) => {
        return throwError(() => err.message || "server error");
      }));
  }

  updateStock(id:any,price:any):Observable<Stock>{
    return this.http.put<Stock>(`http://localhost:5092/api/Stock?stockId=${id}&price=${price}`,`${price}`)
    .pipe(catchError((err: { message: any; }) => {
      return throwError(() => err.message || "server error");
    }));
  }
}
