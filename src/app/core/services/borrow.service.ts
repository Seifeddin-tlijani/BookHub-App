import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Borrow } from '../models/borrow';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BorrowService {
  private apiUrl = 'http://localhost:3000/borrows';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong. Please try again later.'));
  }

  getBorrows(): Observable<Borrow[]> {
    return this.http.get<Borrow[]>(this.apiUrl).pipe(
      map(borrows => 
        borrows
          .filter(borrow => borrow && borrow.book && borrow.borrower)
          .sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime())
      ),
      tap(data => console.log('Filtered and sorted borrows:', data)),
      catchError(this.handleError)
    );
  }

  getBorrowById(id: string | number): Observable<Borrow> {
    return this.http.get<Borrow>(`${this.apiUrl}/${id}`).pipe(
      tap(borrow => console.log('Retrieved borrow:', borrow)),
      catchError(this.handleError)
    );
  }

  addBorrow(borrow: Partial<Borrow>): Observable<Borrow> {
    const formattedBorrow = {
      ...borrow,
      id: Date.now().toString(),
      borrowDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Borrowed'
    };
    
    return this.http.post<Borrow>(this.apiUrl, formattedBorrow).pipe(
      tap(newBorrow => console.log('Created borrow:', newBorrow)),
      catchError(this.handleError)
    );
  }

  updateBorrow(id: string | number, borrow: Partial<Borrow>): Observable<Borrow> {
    return this.http.patch<Borrow>(`${this.apiUrl}/${id}`, borrow).pipe(
      tap(updatedBorrow => console.log('Updated borrow:', updatedBorrow)),
      catchError(this.handleError)
    );
  }

  deleteBorrow(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log('Deleted borrow with id:', id)),
      catchError(this.handleError)
    );
  }

  updateStatus(borrowId: string | number, status: string): Observable<Borrow> {
    console.log('Updating status for borrow:', borrowId, 'to:', status);
    const update = {
      status,
      returnDate: status === 'Returned' ? new Date().toISOString() : null
    };
    
    return this.http.patch<Borrow>(`${this.apiUrl}/${borrowId}`, update).pipe(
      tap(updatedBorrow => console.log('Updated borrow status:', updatedBorrow)),
      catchError(this.handleError)
    );
  }

  updateDueDate(borrowId: string | number, newDueDate: string): Observable<Borrow> {
    console.log('Updating due date for borrow:', borrowId, 'to:', newDueDate);
    const update = {
      dueDate: newDueDate
    };
    
    return this.http.patch<Borrow>(`${this.apiUrl}/${borrowId}`, update).pipe(
      tap(updatedBorrow => console.log('Updated borrow due date:', updatedBorrow)),
      catchError(this.handleError)
    );
  }
}
