import { Component, OnInit, ViewEncapsulation, DoCheck } from '@angular/core';

import { Product }            from '../product';
import { ProductService }     from '../product.service';
import { Transaction }        from '../transaction';
import { TransactionService } from '../transaction.service';
import { WebsocketService}    from '../websocket.service';
import { RecipeService }      from '../recipe.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
  providers: [WebsocketService, RecipeService],
  encapsulation: ViewEncapsulation.None
})
export class TransactionsComponent implements OnInit, DoCheck {

	transactions: Transaction[];
	selectedTransaction: Transaction = new Transaction();
	products: Product[];

  constructor(  private transactionService: TransactionService,
                private productService:     ProductService,
                private recipeService:      RecipeService) {
    this.recipeService.recipes.subscribe(msg => {
      console.log("Message from websocket: " + msg);
    });
  }

  ngOnInit() {
  	this.getTransactions();
  	this.getProducts();
  }

  ngDoCheck(){
  	if(!!this.transactions){
	  	this.transactions.sort(function(a,b){
	  	// Flipped; we want youngest on top
	  		var r = 0;
	  		if (a.Created_date > b.Created_date){
	  			r = -1;
	  		}
	  		else if (a.Created_date < b.Created_date) {
	  			r = 1;
	  		}
	  		return r;
	  	});
  	}
  }



  getTransactions(): void {
  	this.transactionService.getTransactions()
  		.subscribe(transactions => this.transactions = transactions);
  }

  getProducts(): void {
  	this.productService.getProducts()
  		.subscribe(products => this.products = products);
  }

  getProductById(id){
    if(!!this.products){
	  	for (var i = 0; i < this.products.length; i++){
	  		if(this.products[i]._id == id){
	  			return this.products[i];
	  		}
	  	}
  	}
  	return new Product();
  }

  reject(transaction){
    //alert("reject");
    if( confirm("Really mark this transaction as Rejected?\n\nOnly reject transactions that nerver happened or were refunded to the customer. This action can not be un-done.")){
      transaction.rejected = true;
      var m = "";
      while(m==="" || m===null){
        m = prompt("Why should this transaction be rejected?");
      }
      var d = new Date();
      m = d.toUTCString() + " - " + m;
      transaction.rejected_message = m;
      this.transactionService.updateTransaction(transaction);
    }
  }

  print(transaction){
    console.log("Print transaction")
    console.log(transaction);
    this.recipeService.recipes.next({
      recipe: "ASDASD"
    });
  }

}
