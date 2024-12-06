import { Component, OnInit } from '@angular/core';
import { BorrowService } from '@core/services/borrow.service';
import { BookService } from '@core/services/book.service';
import { Borrow, BorrowStatus } from '@core/models/borrow';
import { Book } from '@core/models/book';
import { forkJoin, map } from 'rxjs';

interface BorrowWithBook extends Borrow {
  book?: Book;
}

@Component({
  selector: 'app-borrow-management',
  templateUrl: './borrow-management.component.html',
  styleUrls: ['./borrow-management.component.css']
})
export class BorrowManagementComponent implements OnInit {
  borrows: BorrowWithBook[] = [];
  loading = false;
  error: string | null = null;
  activeTab: 'current' | 'history' = 'current';
  BorrowStatus = BorrowStatus; // For template usage

  constructor(
    private borrowService: BorrowService,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    this.loadBorrows();
  }

  loadBorrows(): void {
    this.loading = true;
    this.error = null;
    
    // Assuming we have the user ID from an auth service
    const userId = 'current-user-id'; // Replace with actual user ID
    
    this.borrowService.getUserBorrows(userId).subscribe({
      next: (borrows) => {
        // Load books for each borrow
        const bookRequests = borrows.map(borrow =>
          this.bookService.getBook(borrow.bookId).pipe(
            map(book => ({
              ...borrow,
              book
            }))
          )
        );

        forkJoin(bookRequests).subscribe({
          next: (borrowsWithBooks) => {
            this.borrows = borrowsWithBooks;
            this.loading = false;
          },
          error: (error) => {
            this.error = 'Error loading book details';
            this.loading = false;
          }
        });
      },
      error: (error) => {
        this.error = 'Error loading borrows';
        this.loading = false;
      }
    });
  }

  returnBook(borrowId: string): void {
    this.loading = true;
    this.borrowService.returnBook(borrowId).subscribe({
      next: () => {
        this.loadBorrows();
      },
      error: (error) => {
        this.error = 'Error returning book';
        this.loading = false;
      }
    });
  }

  extendBorrow(borrowId: string): void {
    this.loading = true;
    this.borrowService.extendBorrow(borrowId).subscribe({
      next: () => {
        this.loadBorrows();
      },
      error: (error) => {
        this.error = 'Error extending borrow period';
        this.loading = false;
      }
    });
  }

  getDaysRemaining(dueDate: Date): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue(dueDate: Date): boolean {
    return this.getDaysRemaining(dueDate) < 0;
  }

  filterBorrows(status: 'current' | 'history'): BorrowWithBook[] {
    return this.borrows.filter(borrow => {
      if (status === 'current') {
        return borrow.status === BorrowStatus.BORROWED || borrow.status === BorrowStatus.OVERDUE;
      } else {
        return borrow.status === BorrowStatus.RETURNED;
      }
    });
  }
}
