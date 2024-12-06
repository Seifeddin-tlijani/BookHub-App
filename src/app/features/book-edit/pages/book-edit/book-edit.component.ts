import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../../../core/services/book.service';
import { Book } from '../../../../core/models/book';

@Component({
  selector: 'app-book-edit',
  templateUrl: './book-edit.component.html',
  styleUrls: ['./book-edit.component.css']
})
export class BookEditComponent implements OnInit {
  bookForm: FormGroup;
  bookId: string = '';
  originalBook: Book | null = null;
  genres: string[] = [];

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      isbn: ['', Validators.required],
      description: [''],
      genre: ['', Validators.required],
      year: ['', Validators.required],
      copies: [0, Validators.required],
      publisher: [''],
      language: [''],
      pages: [0]
    });
  }

  ngOnInit(): void {
    this.bookId = this.route.snapshot.params['id'];
    this.loadGenres();
    if (this.bookId) {
      this.loadBookDetails();
    }
  }

  loadGenres(): void {
    this.genres = this.bookService.getGenres();
  }

  loadBookDetails(): void {
    this.bookService.getBook(this.bookId).subscribe(
      (book: Book) => {
        this.originalBook = book;
        this.bookForm.patchValue({
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          description: book.description,
          genre: book.genre,
          year: book.year,
          copies: book.copies,
          publisher: book.publisher,
          language: book.language,
          pages: book.pages
        });
      },
      (error: Error) => {
        console.error('Error loading book details:', error);
      }
    );
  }

  onSubmit(): void {
    if (this.bookForm.valid && this.originalBook) {
      const bookData: Book = { 
        ...this.originalBook,
        ...this.bookForm.value,
        id: this.bookId,
        imageUrl: this.originalBook.imageUrl // Explicitly preserve imageUrl
      };
      this.bookService.updateBook(bookData).subscribe(
        () => {
          this.router.navigate(['/books']);
        },
        (error: Error) => {
          console.error('Error updating book:', error);
        }
      );
    }
  }
}
