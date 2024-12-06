import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookService } from '../../../../core/services/book.service';
import { Book } from '../../../../core/models/book';
import { CommonModule } from '@angular/common';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService
  ) {}

  ngOnInit() {
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBook(id);
    } else {
      this.error = 'Book ID not found';
      this.loading = false;
    }
  }

  loadBook(id: string) {
    this.loading = true;
    this.error = null;

    this.bookService.getBook(id).subscribe({
      next: (book) => {
        this.book = book;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load book details. Please try again.';
        this.loading = false;
        console.error('Error loading book:', error);
      }
    });
  }

  deleteBook() {
    if (!this.book?.id) return;
    
    if (confirm('Are you sure you want to delete this book?')) {
      this.loading = true;
      this.error = null;
  
      this.bookService.deleteBook(this.book.id).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.error = 'Failed to delete book. Please try again.';
          this.loading = false;
          console.error('Error deleting book:', error);
        }
      });
    }
  }

  onBack() {
    this.router.navigate(['/home']);
  }

  retryLoad() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBook(id);
    }
  }
}
