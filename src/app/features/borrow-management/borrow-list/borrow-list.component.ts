import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { Borrow } from '../../../core/models/borrow';
import { BorrowService } from '../../../core/services/borrow.service';
import { BookService } from '../../../core/services/book.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-borrow-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    HttpClientModule
  ],
  providers: [BorrowService, BookService],
  templateUrl: './borrow-list.component.html',
  styleUrls: ['./borrow-list.component.css'],
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
export class BorrowListComponent implements OnInit {
  borrows: Borrow[] = [];
  filteredBorrows: Borrow[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';

  constructor(
    private borrowService: BorrowService,
    private bookService: BookService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBorrows();
  }

  loadBorrows(): void {
    this.loading = true;
    this.error = null;

    this.borrowService.getBorrows()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          console.log('Raw borrow data:', data);
          this.borrows = data;
          this.filteredBorrows = data;
        },
        error: (err) => {
          console.error('Error loading borrows:', err);
          this.error = 'Failed to load borrowings. Please try again.';
        }
      });
  }

  returnBook(borrow: Borrow): void {
    console.log('Attempting to return book:', borrow);

    if (!borrow.status || borrow.status === 'Returned') {
      this.error = 'This book has already been returned';
      return;
    }

    if (confirm(`Are you sure you want to return "${borrow.book.title}"?`)) {
      this.loading = true;
      this.error = null;

      this.borrowService.updateStatus(borrow.id, 'Returned')
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (updatedBorrow) => {
            console.log('Book return response:', updatedBorrow);
            
            // Update local arrays
            const index = this.borrows.findIndex(b => b.id === updatedBorrow.id);
            if (index !== -1) {
              this.borrows[index] = updatedBorrow;
              this.filteredBorrows = this.filteredBorrows.map(b => 
                b.id === updatedBorrow.id ? updatedBorrow : b
              );
            }
            
            // Update book copies
            this.bookService.getBook(borrow.book.id).subscribe({
              next: (book) => {
                console.log('Retrieved book for update:', book);
                if (book) {
                  const updatedBook = { ...book, copies: book.copies + 1 };
                  this.bookService.updateBook(updatedBook).subscribe({
                    next: (response) => console.log('Book copies updated:', response),
                    error: (err) => console.error('Error updating book copies:', err)
                  });
                }
              },
              error: (err) => {
                console.error('Error getting book:', err);
              }
            });
          },
          error: (err) => {
            console.error('Error returning book:', err);
            this.error = 'Failed to return book. Please try again.';
          }
        });
    }
  }

  extendBorrow(borrow: Borrow): void {
    console.log('Attempting to extend borrow:', borrow);

    if (!borrow.status || borrow.status === 'Returned') {
      this.error = 'Cannot extend a returned book';
      return;
    }

    if (confirm(`Are you sure you want to extend the borrow period for "${borrow.book.title}" by 14 days?`)) {
      this.loading = true;
      this.error = null;

      const currentDueDate = new Date(borrow.dueDate);
      const newDueDate = new Date(currentDueDate.setDate(currentDueDate.getDate() + 14));

      console.log('Current due date:', currentDueDate);
      console.log('New due date:', newDueDate);

      this.borrowService.updateDueDate(borrow.id, newDueDate.toISOString())
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (updatedBorrow) => {
            console.log('Borrow extension response:', updatedBorrow);
            const index = this.borrows.findIndex(b => b.id === updatedBorrow.id);
            if (index !== -1) {
              this.borrows[index] = updatedBorrow;
              this.filteredBorrows = this.filteredBorrows.map(b => 
                b.id === updatedBorrow.id ? updatedBorrow : b
              );
            }
          },
          error: (err) => {
            console.error('Error extending borrow:', err);
            this.error = 'Failed to extend borrow period. Please try again.';
          }
        });
    }
  }

  isOverdue(borrow: Borrow): boolean {
    if (borrow.status === 'Returned') return false;
    const dueDate = new Date(borrow.dueDate);
    const now = new Date();
    return dueDate < now;
  }

  getBorrowStatus(borrow: Borrow): string {
    if (borrow.status === 'Returned') return 'returned';
    return this.isOverdue(borrow) ? 'overdue' : 'active';
  }

  getStatusIcon(borrow: Borrow): string {
    if (borrow.status === 'Returned') return 'fa-check-circle';
    return this.isOverdue(borrow) ? 'fa-exclamation-circle' : 'fa-clock';
  }

  getBorrowStatusText(borrow: Borrow): string {
    if (borrow.status === 'Returned') return 'Returned';
    return this.isOverdue(borrow) ? 'Overdue' : 'Active';
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredBorrows = this.borrows;
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredBorrows = this.borrows.filter(b => 
      b.book.title.toLowerCase().includes(term) ||
      b.book.author.toLowerCase().includes(term) ||
      b.borrower.name.toLowerCase().includes(term)
    );
  }

  viewDetails(borrow: Borrow): void {
    this.router.navigate(['/borrows', borrow.id]);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default-book.png';
  }
}
