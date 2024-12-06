import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Borrow, BorrowStatus } from '../models/borrow';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BorrowService {
  private apiUrl = `${environment.apiUrl}/borrows`;

  constructor(private http: HttpClient) {}

  // Get all borrows for a user
  getUserBorrows(userId: string): Observable<Borrow[]> {
    return this.http.get<Borrow[]>(`${this.apiUrl}/user/${userId}`).pipe(
      map(borrows => borrows.map(borrow => ({
        ...borrow,
        borrowDate: new Date(borrow.borrowDate),
        dueDate: new Date(borrow.dueDate),
        returnDate: borrow.returnDate ? new Date(borrow.returnDate) : undefined
      })))
    );
  }

  // Borrow a book
  borrowBook(bookId: string, userId: string): Observable<Borrow> {
    return this.http.post<Borrow>(`${this.apiUrl}`, {
      bookId,
      userId,
      borrowDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: BorrowStatus.BORROWED
    });
  }

  // Return a book
  returnBook(borrowId: string): Observable<Borrow> {
    return this.http.patch<Borrow>(`${this.apiUrl}/${borrowId}`, {
      returnDate: new Date(),
      status: BorrowStatus.RETURNED
    });
  }

  // Extend borrow period
  extendBorrow(borrowId: string): Observable<Borrow> {
    return this.http.patch<Borrow>(`${this.apiUrl}/${borrowId}/extend`, {
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Extend by 7 days
    });
  }

  // Get overdue borrows
  getOverdueBorrows(): Observable<Borrow[]> {
    return this.http.get<Borrow[]>(`${this.apiUrl}/overdue`);
  }
}
