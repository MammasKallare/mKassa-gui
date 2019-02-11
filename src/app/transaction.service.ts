import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';
import { of } from 'rxjs/observable/of';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Product } from './product';
import { Transaction } from './transaction';
import { PRODUCTS } from './mock-products';
import { MessageService } from './message.service';

@Injectable()
export class TransactionService {

  private productsUrl = 'http://127.0.0.1:3000/product';
  private transactionsUrl = 'http://127.0.0.1:3000/transaction';

  constructor(
  	private http: HttpClient) { }

  getTransactions(): Observable<Transaction[]> {
  	//this.messageService.add('ProductService: fetched products');
  	//return of(PRODUCTS);
  	return this.http.get<Transaction[]>(this.transactionsUrl);
  }

  postTransaction(t) {
  	return this.http.post<Transaction>(this.transactionsUrl,t).subscribe();
  }

  updateTransaction(t) {
    return this.http.put<Transaction>(this.transactionsUrl + "/" + t._id,t).subscribe();
  }

}
