import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BookService } from '../../../../core/services/book.service';
import { Book } from '../../../../core/models/book';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookListComponent } from '../../components/book-list/book-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, BookListComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  books$: Observable<Book[]>;

  constructor(private bookService: BookService) {
    this.books$ = this.bookService.getBooks();
  }

  ngOnInit(): void {}
}
