import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookService } from '../../../../core/services/book.service';
import { Book } from '../../../../core/models/book';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-book.component.html',
  styleUrls: ['./add-book.component.css']
})
export class AddBookComponent {
  newBook: Partial<Book> = {
    title: '',
    author: '',
    genre: '',
    year: new Date().getFullYear(),
    copies: 1,
    imageUrl: ''
  };

  error: string | null = null;
  saving = false;

  constructor(
    private bookService: BookService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.saving = true;
    this.error = null;

    this.bookService.addBook(this.newBook as Book).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/book-management']);
      },
      error: (error) => {
        this.error = 'Failed to add book. Please try again.';
        this.saving = false;
        console.error('Error adding book:', error);
      }
    });
  }

  private validateForm(): boolean {
    if (!this.newBook.title?.trim()) {
      this.error = 'Title is required';
      return false;
    }
    if (!this.newBook.author?.trim()) {
      this.error = 'Author is required';
      return false;
    }
    if (!this.newBook.genre?.trim()) {
      this.error = 'Genre is required';
      return false;
    }
    if (!this.newBook.imageUrl?.trim()) {
      this.error = 'Image URL is required';
      return false;
    }
    if (!this.newBook.year || this.newBook.year < 0) {
      this.error = 'Valid year is required';
      return false;
    }
    if (!this.newBook.copies || this.newBook.copies < 0) {
      this.error = 'Number of copies must be 0 or greater';
      return false;
    }
    return true;
  }

  cancel() {
    this.router.navigate(['/book-management']);
  }
}
