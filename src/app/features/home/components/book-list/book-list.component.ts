import { Component, OnInit } from '@angular/core';
import { Book } from '../../../../core/models/book';
import { BookService } from '../../../../core/services/book.service';
import { BorrowService } from '../../../../core/services/borrow.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Borrow } from '../../../../core/models/borrow';
import { of, catchError, finalize, switchMap } from 'rxjs';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css'],
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  filteredBooks: Book[] = [];
  searchTerm = '';
  selectedGenre = '';
  sortBy = 'year';
  loading = true;
  error: string | null = null;
  genres: string[] = [];
  showGenreDropdown = false;
  showSortDropdown = false;
  borrowingBooks = new Set<string>();

  constructor(private bookService: BookService, private borrowService: BorrowService) {}

  ngOnInit(): void {
    this.loading = true;
    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.loading = false;
        this.loadGenres();
        this.applyFilters();
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
      },
    });
  }

  loadBooks(): void {
    this.loading = true;
    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.filteredBooks = books;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error loading books';
        this.loading = false;
        console.error('Error loading books:', error);
      },
    });
  }

  loadGenres(): void {
    this.genres = this.bookService.getGenres();
  }

  onSearch(): void {
    this.applyFilters();
  }

  onGenreChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  toggleGenreDropdown(): void {
    this.showGenreDropdown = !this.showGenreDropdown;
    this.showSortDropdown = false; // Close other dropdown
  }

  toggleSortDropdown(): void {
    this.showSortDropdown = !this.showSortDropdown;
    this.showGenreDropdown = false; // Close other dropdown
  }

  private applyFilters(): void {
    let filtered = [...this.books];

    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower)
      );
    }

    if (this.selectedGenre) {
      filtered = filtered.filter((book) => book.genre === this.selectedGenre);
    }

    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'year':
          return b.year - a.year;
        default:
          return 0;
      }
    });

    this.filteredBooks = filtered;
  }

  borrowBook(book: Book) {
    if (!book || book.copies <= 0 || this.borrowingBooks.has(book.id)) {
      return;
    }

    this.borrowingBooks.add(book.id);
    const borrow: Borrow = {
      id: 0,
      bookTitle: book.title,
      userId: 1,
      borrowDate: new Date().toISOString(),
      returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Borrowed'
    };

    this.borrowService.addBorrow(borrow).pipe(
      switchMap(() => {
        const updatedBook = { ...book, copies: book.copies - 1 };
        return this.bookService.updateBook(updatedBook);
      }),
      catchError((error) => {
        console.error('Error in borrow process:', error);
        alert('Failed to borrow book. Please try again.');
        return of(null);
      }),
      finalize(() => {
        this.borrowingBooks.delete(book.id);
      })
    ).subscribe({
      next: (updatedBook) => {
        if (updatedBook) {
          // Update both arrays
          this.books = this.books.map(b => b.id === book.id ? updatedBook : b);
          this.filteredBooks = this.filteredBooks.map(b => b.id === book.id ? updatedBook : b);
          alert('Book borrowed successfully!');
        }
      }
    });
  }

  isBorrowing(bookId: string): boolean {
    return this.borrowingBooks.has(bookId);
  }

  trackById(index: number, book: Book): string {
    return book.id;
  }
}