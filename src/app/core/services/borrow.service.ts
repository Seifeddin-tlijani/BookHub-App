import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Borrow } from '../models/borrow';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BorrowService {

  private apiUrl = 'http://localhost:3000/borrows';

  constructor(private http: HttpClient) {}

  getBorrows(): Observable<Borrow[]> {
    return this.http.get<Borrow[]>(this.apiUrl);
  }

  getBorrowById(id: number): Observable<Borrow> {
    return this.http.get<Borrow>(`${this.apiUrl}/${id}`);
  }

  addBorrow(borrow: Borrow): Observable<Borrow> {
    return this.http.post<Borrow>(this.apiUrl, borrow);
  }

  updateBorrow(id: number, borrow: Borrow): Observable<Borrow> {
    return this.http.put<Borrow>(`${this.apiUrl}/${id}`, borrow);
  }

  deleteBorrow(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


}
