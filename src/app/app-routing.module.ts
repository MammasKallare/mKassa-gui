import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';

import { ProductsComponent } from './products/products.component';
import { ProductsEditComponent } from './products-edit/products-edit.component';
import { TransactionsComponent } from './transactions/transactions.component';

const routes: Routes = [
  		{ path: 'products', component: ProductsComponent },
      { path: 'products-edit', component: ProductsEditComponent },
  		{ path: 'transactions', component: TransactionsComponent }
	];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  declarations: [],
  exports: [ RouterModule ]
})

export class AppRoutingModule { 
	
}
