import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Book } from '../models/book';
@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = `http://localhost:3000/books`;
  private genres: Set<string> = new Set();

  constructor(private http: HttpClient) {}

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl).pipe(
      tap(books => this.updateGenres(books)),
      catchError(this.handleError)
    );
  }

  getBook(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  addBook(book: Book): Observable<Book> {
    if (book.genre) {
      this.genres.add(book.genre);
    }
    return this.http.post<Book>(this.apiUrl, book).pipe(
      catchError(this.handleError)
    );
  }

  updateBook(book: Book): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${book.id}`, book).pipe(
      catchError(this.handleError)
    );
  }

  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getGenres(): string[] {
    return Array.from(this.genres);
  }

  private updateGenres(books: Book[]): void {
    books.forEach(book => {
      if (book.genre) {
        this.genres.add(book.genre);
      }
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
