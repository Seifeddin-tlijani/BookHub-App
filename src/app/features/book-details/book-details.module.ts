import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookDetailsRoutingModule } from './book-details-routing.module';
import { BookDetailsComponent } from './pages/book-details/book-details.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BookDetailsRoutingModule
  ]
})
export class BookDetailsModule { }
