import { Component } from '@angular/core';
import { BookListComponent } from '../../components/book-list/book-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BookListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {}
