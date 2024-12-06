import { Routes } from '@angular/router';
import { BookDetailsComponent } from './features/book-details/pages/book-details/book-details.component';

export const routes: Routes = [
    {
      path: '',
      redirectTo: 'home',
      pathMatch: 'full'
    },
    {
      path: 'home',
      loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
    },
    {
      path: 'book/:id',
      component: BookDetailsComponent
    },
    {
      path: 'books',
      loadChildren: () => import('./features/book-management/book-management.module').then(m => m.BookManagementModule)
    },
    {
      path: 'books/edit/:id',
      loadChildren: () => import('./features/book-edit/book-edit.module').then(m => m.BookEditModule)
    }
];