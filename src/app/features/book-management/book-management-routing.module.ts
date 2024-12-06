import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookManagementComponent } from './pages/book-management/book-management.component';
import { BookDetailsComponent } from '../book-details/pages/book-details/book-details.component';

const routes: Routes = [
  {
    path: '',
    component: BookManagementComponent
  },
  {
    path: ':id',
    component: BookDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookManagementRoutingModule { }
