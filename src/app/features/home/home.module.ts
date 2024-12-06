import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HomeRoutingModule } from './home-routing.module';
import { BookListComponent } from './components/book-list/book-list.component';

@NgModule({
  declarations: [
    BookListComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
