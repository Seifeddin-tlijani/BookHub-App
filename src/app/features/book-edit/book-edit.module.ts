import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookEditRoutingModule } from './book-edit-routing.module';
import { BookEditComponent } from './pages/book-edit/book-edit.component';
import { SharedModule } from '../../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    BookEditComponent
  ],
  imports: [
    CommonModule,
    BookEditRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class BookEditModule { }
