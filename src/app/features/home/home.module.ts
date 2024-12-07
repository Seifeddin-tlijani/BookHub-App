import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HomeRoutingModule } from './home-routing.module';
import { BookListComponent } from './components/book-list/book-list.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HomeRoutingModule,
    BookListComponent,
  ],
})
export class HomeModule {}
