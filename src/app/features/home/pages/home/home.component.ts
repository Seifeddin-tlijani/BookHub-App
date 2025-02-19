import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../../../core/services/book.service';
import { BorrowService } from '../../../../core/services/borrow.service';
import { Book } from '../../../../core/models/book';
import { Borrow } from '../../../../core/models/borrow';

interface Activity {
  type: 'borrow' | 'return';
  icon: string;
  title: string;
  description: string;
  time: string;
}

interface BorrowForm {
  borrowerName: string;
  borrowerEmail: string;
  borrowDate: string;
  dueDate: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  totalBooks: number = 0;
  activeBorrows: number = 0;
  uniqueGenres: number = 0;
  recentActivities: Activity[] = [];
  
  // Books section
  books: Book[] = [];
  filteredBooks: Book[] = [];
  searchQuery: string = '';
  loading: boolean = false;
  error: string | null = null;

  // Catalogue section
  genres: string[] = [];
  selectedGenre: string = '';
  sortBy: 'title' | 'author' | 'year' | 'copies' = 'title';
  catalogueBooks: Book[] = [];

  // Borrow Modal
  showBorrowModal: boolean = false;
  selectedBook: Book | null = null;
  borrowForm: BorrowForm = {
    borrowerName: '',
    borrowerEmail: '',
    borrowDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };
  borrowing: boolean = false;
  borrowError: string | null = null;

  constructor(
    private bookService: BookService,
    private borrowService: BorrowService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBooks();
    this.loadStats();
  }

  loadStats(): void {
    // Load total books
    this.bookService.getBooks().subscribe((books: Book[]) => {
      this.totalBooks = books.length;
      // Calculate unique genres
      const genres = new Set(books.map((book: Book) => book.genre));
      this.uniqueGenres = genres.size;
    });

    // Load active borrows
    this.borrowService.getBorrows().subscribe((borrows: Borrow[]) => {
      this.activeBorrows = borrows.filter((borrow: Borrow) => borrow.status !== 'Returned').length;
    });
  }

  loadBooks(): void {
    this.loading = true;
    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.filteredBooks = books;
        this.loading = false;
        // Extract unique genres
        this.genres = [...new Set(books.map(book => book.genre))];
      },
      error: (error) => {
        this.error = 'Failed to load books';
        this.loading = false;
        console.error('Error loading books:', error);
      }
    });
  }

  filterBooks(): void {
    let filtered = [...this.books];

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.genre.toLowerCase().includes(query)
      );
    }

    // Apply genre filter
    if (this.selectedGenre) {
      filtered = filtered.filter(book => book.genre === this.selectedGenre);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'year':
          return b.year - a.year;
        default:
          return 0;
      }
    });

    this.filteredBooks = filtered;
  }

  borrowBook(book: Book): void {
    if (book.copies === 0) {
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days from now

    const newBorrow: Borrow = {
      id: '', // Will be set by service
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        imageUrl: book.imageUrl
      },
      borrower: {
        name: 'Test User',
        email: 'test.user@example.com'
      },
      borrowDate: new Date().toISOString(),
      dueDate: dueDate.toISOString(),
      status: 'Borrowed'
    };

    this.borrowService.addBorrow(newBorrow).subscribe({
      next: () => {
        // Update book's copies
        book.copies--;
        this.bookService.updateBook(book).subscribe({
          next: () => {
            // Show success message or notification
            console.log('Book borrowed successfully');
          },
          error: (error) => {
            console.error('Error updating book:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error borrowing book:', error);
      }
    });
  }

  loadRecentActivities(): void {
    this.borrowService.getBorrows().subscribe((borrows: Borrow[]) => {
      // Sort borrows by date and take the most recent 5
      const recentBorrows: Activity[] = borrows
        .sort((a: Borrow, b: Borrow) => 
          new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime()
        )
        .slice(0, 5)
        .map((borrow: Borrow): Activity => {
          let type: 'borrow' | 'return' = 'borrow';
          let icon: string = 'fa-exchange-alt';
          let title: string = 'Book Borrowed';
          let description: string = `${borrow.borrower.name} borrowed "${borrow.book.title}"`;

          if (borrow.status === 'Returned') {
            type = 'return';
            icon = 'fa-undo';
            title = 'Book Returned';
            description = `${borrow.borrower.name} returned "${borrow.book.title}"`;
          }

          return {
            type,
            icon,
            title,
            description,
            time: borrow.status === 'Returned' ? borrow.returnDate! : borrow.borrowDate
          };
        });

      this.recentActivities = recentBorrows;
    });
  }

  getStockStatus(book: Book): string {
    if (!book.copies) return 'out-of-stock';
    if (book.copies <= 2) return 'low-stock';
    return 'in-stock';
  }

  getStockIcon(book: Book): string {
    if (!book.copies) return 'fa-times-circle';
    if (book.copies <= 2) return 'fa-exclamation-circle';
    return 'fa-check-circle';
  }

  getStockText(book: Book): string {
    if (!book.copies) return 'Out of Stock';
    if (book.copies <= 2) return `${book.copies} Left`;
    return `${book.copies} in Stock`;
  }

  submitBorrow(): void {
    if (!this.selectedBook) return;

    this.borrowing = true;
    this.borrowError = null;

    const borrow: Partial<Borrow> = {
      book: this.selectedBook,
      borrower: {
        name: this.borrowForm.borrowerName,
        email: this.borrowForm.borrowerEmail
      },
      borrowDate: new Date(this.borrowForm.borrowDate).toISOString(),
      dueDate: new Date(this.borrowForm.dueDate).toISOString(),
      status: 'Borrowed'
    };

    this.borrowService.addBorrow(borrow).subscribe({
      next: (newBorrow) => {
        // Update book copies
        const updatedBook = { 
          ...this.selectedBook!, 
          copies: this.selectedBook!.copies - 1 
        };
        
        this.bookService.updateBook(updatedBook).subscribe({
          next: () => {
            // Update local book lists
            this.updateBookInLists(updatedBook);
            
            // Close modal and show success
            this.showBorrowModal = false;
            this.borrowing = false;
            this.selectedBook = null;
            
            // Refresh activities
            this.loadRecentActivities();
          },
          error: (err) => {
            console.error('Error updating book:', err);
            this.borrowError = 'Failed to update book copies. Please try again.';
            this.borrowing = false;
          }
        });
      },
      error: (err) => {
        console.error('Error creating borrow:', err);
        this.borrowError = 'Failed to create borrow. Please try again.';
        this.borrowing = false;
      }
    });
  }

  private updateBookInLists(updatedBook: Book): void {
    // Update in books array
    const bookIndex = this.books.findIndex(b => b.id === updatedBook.id);
    if (bookIndex !== -1) {
      this.books[bookIndex] = updatedBook;
    }

    // Update in filtered books
    const filteredIndex = this.filteredBooks.findIndex(b => b.id === updatedBook.id);
    if (filteredIndex !== -1) {
      this.filteredBooks[filteredIndex] = updatedBook;
    }

    // Update in catalogue books
    const catalogueIndex = this.catalogueBooks.findIndex(b => b.id === updatedBook.id);
    if (catalogueIndex !== -1) {
      this.catalogueBooks[catalogueIndex] = updatedBook;
    }
  }

  closeBorrowModal(): void {
    this.showBorrowModal = false;
    this.selectedBook = null;
    this.borrowError = null;
  }

  viewBookDetails(book: Book): void {
    this.router.navigate(['/books', book.id]);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default-book.png';
  }
}
