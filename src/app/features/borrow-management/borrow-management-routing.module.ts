import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BorrowListComponent } from './borrow-list/borrow-list.component';
import { BorrowDetailsComponent } from './borrow-details/borrow-details.component';

const routes: Routes = [
  { path: '', component: BorrowListComponent },
  { path: 'details/:id', component: BorrowDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BorrowManagementRoutingModule { }
