import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Borrow } from '../../../core/models/borrow';
import { BorrowService } from '../../../core/services/borrow.service';
import { BookService } from '../../../core/services/book.service';
import { finalize } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-borrow-details',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  providers: [BorrowService, BookService],
  templateUrl: './borrow-details.component.html',
  styleUrls: ['./borrow-details.component.css'],
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
export class BorrowDetailsComponent implements OnInit {
  borrow: Borrow | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private borrowService: BorrowService,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    this.loadBorrowDetails();
  }

  loadBorrowDetails(): void {
    const borrowId = this.route.snapshot.paramMap.get('id');
    if (!borrowId) {
      this.error = 'Invalid borrow ID';
      return;
    }

    this.loading = true;
    this.error = null;

    this.borrowService.getBorrowById(borrowId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          console.log('Loaded borrow details:', data);
          this.borrow = data;
        },
        error: (err) => {
          console.error('Error loading borrow details:', err);
          this.error = 'Failed to load borrow details. Please try again.';
        }
      });
  }

  returnBook(): void {
    if (!this.borrow || this.borrow.status === 'Returned') {
      this.error = 'This book has already been returned';
      return;
    }

    if (confirm(`Are you sure you want to return "${this.borrow.book.title}"?`)) {
      this.loading = true;
      this.error = null;

      this.borrowService.updateStatus(this.borrow.id, 'Returned')
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (updatedBorrow) => {
            console.log('Book return response:', updatedBorrow);
            this.borrow = updatedBorrow;
            
            // Update book copies
            this.bookService.getBook(this.borrow.book.id).subscribe({
              next: (book) => {
                if (book) {
                  const updatedBook = { ...book, copies: book.copies + 1 };
                  this.bookService.updateBook(updatedBook).subscribe({
                    next: (response) => console.log('Book copies updated:', response),
                    error: (err) => console.error('Error updating book copies:', err)
                  });
                }
              },
              error: (err) => console.error('Error getting book:', err)
            });
          },
          error: (err) => {
            console.error('Error returning book:', err);
            this.error = 'Failed to return book. Please try again.';
          }
        });
    }
  }

  extendBorrow(): void {
    if (!this.borrow || this.borrow.status === 'Returned') {
      this.error = 'Cannot extend a returned book';
      return;
    }

    if (this.isOverdue()) {
      this.error = 'Cannot extend an overdue book';
      return;
    }

    if (confirm(`Are you sure you want to extend the borrow period for "${this.borrow.book.title}" by 14 days?`)) {
      this.loading = true;
      this.error = null;

      const currentDueDate = new Date(this.borrow.dueDate);
      const newDueDate = new Date(currentDueDate.setDate(currentDueDate.getDate() + 14));

      this.borrowService.updateDueDate(this.borrow.id, newDueDate.toISOString())
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (updatedBorrow) => {
            console.log('Borrow extension response:', updatedBorrow);
            this.borrow = updatedBorrow;
          },
          error: (err) => {
            console.error('Error extending borrow:', err);
            this.error = 'Failed to extend borrow period. Please try again.';
          }
        });
    }
  }

  isOverdue(): boolean {
    if (!this.borrow || this.borrow.status === 'Returned') return false;
    return new Date(this.borrow.dueDate) < new Date();
  }

  getBorrowStatus(): string {
    if (!this.borrow) return '';
    if (this.borrow.status === 'Returned') return 'returned';
    return this.isOverdue() ? 'overdue' : 'active';
  }

  getStatusIcon(): string {
    if (!this.borrow) return '';
    if (this.borrow.status === 'Returned') return 'fa-check-circle';
    return this.isOverdue() ? 'fa-exclamation-circle' : 'fa-clock';
  }

  getStatusText(): string {
    if (!this.borrow) return '';
    if (this.borrow.status === 'Returned') return 'Returned';
    return this.isOverdue() ? 'Overdue' : 'Active';
  }

  getDurationInDays(): number {
    if (!this.borrow) return 0;
    const start = new Date(this.borrow.borrowDate);
    const end = this.borrow.returnDate ? new Date(this.borrow.returnDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  goBack(): void {
    this.router.navigate(['/borrows']);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default-book.png';
  }
}
