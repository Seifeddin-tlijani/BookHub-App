import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookListComponent } from '../../components/book-list/book-list.component';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../../../core/services/book.service';
import { Observable } from 'rxjs';
import { Book } from '../../../../core/models/book';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, BookListComponent, FormsModule],
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
