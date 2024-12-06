import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { BookManagementRoutingModule } from './book-management-routing.module';
import { BookManagementComponent } from './pages/book-management/book-management.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    BookManagementRoutingModule,
    BookManagementComponent
  ],
})
export class BookManagementModule {}
