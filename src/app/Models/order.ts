import { Stock } from '../Models/stock';

export interface order{
    stockID:number,
    price:number,
    quantity:number,
    personName:string,
    stock:Stock
}