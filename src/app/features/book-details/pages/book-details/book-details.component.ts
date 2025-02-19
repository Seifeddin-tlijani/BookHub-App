import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookService } from '../../../../core/services/book.service';
import { Book } from '../../../../core/models/book';
import { CommonModule } from '@angular/common';
import { BorrowService } from '../../../../core/services/borrow.service';
import { Borrow } from '../../../../core/models/borrow';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BookDetailsComponent implements OnInit {
  book: Book | null = null;
  loading = false;
  error: string | null = null;
  borrowing = false;

  currentUser = {
    id: '1',
    name: 'Test User',
    email: 'test.user@example.com'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private borrowService: BorrowService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBook(id);
    } else {
      this.error = 'Book ID not found';
    }
  }

  loadBook(id: string) {
    this.loading = true;
    this.error = null;

    this.bookService.getBook(id).pipe(
      catchError((error) => {
        console.error('Error loading book:', error);
        this.error = 'Failed to load book details. Please try again.';
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(book => {
      if (book) {
        this.book = book;
      }
    });
  }

  borrowBook() {
    if (!this.book || this.book.copies <= 0 || this.borrowing) {
      return;
    }

    this.borrowing = true;
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    
    const newBorrow: Borrow = {
      id: '', // Will be set by service
      book: {
        id: this.book.id,
        title: this.book.title,
        author: this.book.author,
        imageUrl: this.book.imageUrl
      },
      borrower: {
        name: this.currentUser.name,
        email: this.currentUser.email
      },
      borrowDate: new Date().toISOString(),
      dueDate: dueDate.toISOString(),
      status: 'Borrowed'
    };

    this.borrowService.addBorrow(newBorrow).pipe(
      tap(response => console.log('Borrow created:', response)),
      switchMap(() => {
        const updatedBook = { ...this.book!, copies: this.book!.copies - 1 };
        return this.bookService.updateBook(updatedBook);
      }),
      finalize(() => {
        this.borrowing = false;
      })
    ).subscribe({
      next: (updatedBook) => {
        if (updatedBook) {
          this.book = updatedBook;
          alert('Book borrowed successfully!');
          this.router.navigate(['/borrows']);
        }
      },
      error: (error) => {
        console.error('Error in borrow process:', error);
        alert('Failed to borrow book. Please try again.');
      }
    });
  }

  deleteBook() {
    if (!this.book?.id) return;
    
    if (confirm('Are you sure you want to delete this book?')) {
      this.loading = true;
      this.error = null;
  
      this.bookService.deleteBook(this.book.id).pipe(
        catchError((error) => {
          console.error('Error deleting book:', error);
          this.error = 'Failed to delete book. Please try again.';
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      ).subscribe({
        next: (result) => {
          if (result !== null) {
            this.router.navigate(['/home']);
          }
        }
      });
    }
  }

  onBack() {
    this.router.navigate(['/home']);
  }
}
