import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Book } from '../../../../core/models/book';
import { BookService } from '../../../../core/services/book.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-book-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-management.component.html',
  styleUrls: ['./book-management.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class BookManagementComponent implements OnInit {
  books: Book[] = [];
  filteredBooks: Book[] = [];
  loading = false;
  showAddForm = false;
  error: string | null = null;
  searchTerm = '';
  newBook: Book = {
    id: '',
    title: '',
    author: '',
    genre: '',
    year: new Date().getFullYear(),
    copies: 1,
    imageUrl: ''
  };
  deleteError = false;
  deletingBookId: string | null = null;

  constructor(
    private bookService: BookService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.loading = true;
    this.error = null;
    this.bookService.getBooks().subscribe({
      next: (books: Book[]) => {
        this.books = books;
        this.filteredBooks = books;
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = 'Failed to load books. Please try again.';
        console.error('Error loading books:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredBooks = this.books;
      return;
    }
    
    this.filteredBooks = this.books.filter(book => 
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term) ||
      book.genre.toLowerCase().includes(term)
    );
  }

  onSubmit(): void {
    if (!this.newBook.title || !this.newBook.author) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.error = null;

    this.bookService.addBook(this.newBook).subscribe({
      next: (book: Book) => {
        this.books.push(book);
        this.onSearch(); // Update filtered books
        this.loading = false;
        this.showAddForm = false;
        this.resetNewBook();
      },
      error: (error: Error) => {
        this.error = 'Failed to add book. Please try again.';
        console.error('Error adding book:', error);
        this.loading = false;
      }
    });
  }

  private resetNewBook(): void {
    this.newBook = {
      id: '',
      title: '',
      author: '',
      genre: '',
      year: new Date().getFullYear(),
      copies: 1,
      imageUrl: ''
    };
  }

  viewBook(book: Book): void {
    this.router.navigate(['/book', book.id]);
  }

  editBook(book: Book): void {
    this.router.navigate(['/books/edit', book.id]);
  }

  deleteBook(book: Book): void {
    if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
      this.deletingBookId = book.id;
      this.deleteError = false;
      
      this.bookService.deleteBook(book.id).subscribe({
        next: () => {
          this.books = this.books.filter(b => b.id !== book.id);
          this.onSearch();
          this.deletingBookId = null;
        },
        error: (error: Error) => {
          this.deleteError = true;
          console.error('Error deleting book:', error);
          this.deletingBookId = null;
        }
      });
    }
  }

  trackBookById(index: number, book: Book): string {
    return book.id;
  }

  getYearRange(): number[] {
    const currentYear = new Date().getFullYear();
    const startYear = 1900;
    const years: number[] = [];
    for (let year = currentYear; year >= startYear; year--) {
      years.push(year);
    }
    return years;
  }

  getStockStatus(book: any): string {
    if (!book.copies) return 'out-of-stock';
    if (book.copies <= 2) return 'low-stock';
    return 'in-stock';
  }

  getStockIcon(book: any): string {
    if (!book.copies) return 'fa-times-circle';
    if (book.copies <= 2) return 'fa-exclamation-circle';
    return 'fa-check-circle';
  }

  getStockText(book: any): string {
    if (!book.copies) return 'Out of Stock';
    if (book.copies <= 2) return `${book.copies} Left`;
    return `${book.copies} in Stock`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default-book.png';
  }
}
