import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { BorrowManagementRoutingModule } from './borrow-management-routing.module';
import { BorrowListComponent } from './borrow-list/borrow-list.component';
import { BorrowDetailsComponent } from './borrow-details/borrow-details.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    BorrowManagementRoutingModule,
    BorrowListComponent,
    BorrowDetailsComponent
  ]
})
export class BorrowManagementModule { }
