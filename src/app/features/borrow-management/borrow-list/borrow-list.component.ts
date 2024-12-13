import { Component, OnInit } from '@angular/core';
import { Borrow } from '../../../core/models/borrow';
import { BorrowService } from '../../../core/services/borrow.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-borrow-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './borrow-list.component.html',
  styleUrl: './borrow-list.component.css',
})
export class BorrowListComponent implements OnInit {
  borrows: Borrow[] = [];

  constructor(private borrowService: BorrowService) {}

  ngOnInit(): void {
    this.borrowService.getBorrows().subscribe((data) => {
      console.log('Borrows data:', data); // Log the borrows to see the structure

      this.borrows = data;
    });
  }

  getDurationInDays(borrowDate: string, returnDate: string): number {
    const start = new Date(borrowDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // returnBook(borrow: Borrow): void {
  //   if (borrow.status === 'Borrowed') {
  //     borrow.status = 'Returned';

  //     this.borrowService.updateBorrowStatus(borrow.id, 'Returned').subscribe({
  //       next: () => console.log(`Book with ID ${borrow.id} marked as returned.`),
  //       error: (err) => console.error('Failed to update the status:', err),
  //     });
  //   }
  // }

  onReturn(borrowId: number) {
    const newStatus = 'Returned';

    this.borrowService.updateStatus(borrowId, newStatus).subscribe(
      (updatedBorrow) => {
        // Update the local borrows array with the updated borrow
        const index = this.borrows.findIndex((b) => b.id === updatedBorrow.id);
        if (index !== -1) {
          this.borrows[index] = updatedBorrow;
        }
      },
      (error) => {
        console.error('Error updating borrow status:', error);
      }
    );
  }
}
