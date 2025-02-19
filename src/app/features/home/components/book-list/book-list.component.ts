import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { Book } from '../../../../core/models/book';
import { BookService } from '../../../../core/services/book.service';
import { BorrowService } from '../../../../core/services/borrow.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Borrow } from '../../../../core/models/borrow';
import { 
  of, 
  catchError, 
  finalize, 
  switchMap, 
  Subject, 
  takeUntil, 
  debounceTime, 
  distinctUntilChanged,
  BehaviorSubject,
  combineLatest,
  map
} from 'rxjs';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookListComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;

  private destroy$ = new Subject<void>();
  private searchSubject$ = new BehaviorSubject<string>('');
  private genreSubject$ = new BehaviorSubject<string>('');
  private sortSubject$ = new BehaviorSubject<string>('year');
  private booksSubject$ = new BehaviorSubject<Book[]>([]);

  books$ = this.booksSubject$.asObservable();
  filteredBooks$ = combineLatest([
    this.books$,
    this.searchSubject$,
    this.genreSubject$,
    this.sortSubject$
  ]).pipe(
    map(([books, search, genre, sort]) => this.filterAndSortBooks(books, search, genre, sort))
  );

  loading = true;
  error: string | null = null;
  genres: string[] = [];
  showGenreDropdown = false;
  showSortDropdown = false;
  borrowingBooks = new Set<string>();

  get searchTerm(): string {
    return this.searchSubject$.value;
  }

  set searchTerm(value: string) {
    this.searchSubject$.next(value);
  }

  get selectedGenre(): string {
    return this.genreSubject$.value;
  }

  set selectedGenre(value: string) {
    this.genreSubject$.next(value);
  }

  get sortBy(): string {
    return this.sortSubject$.value;
  }

  set sortBy(value: string) {
    this.sortSubject$.next(value);
  }

  constructor(
    private bookService: BookService, 
    private borrowService: BorrowService
  ) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadInitialData();
  }

  private setupSearchDebounce(): void {
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // Search is now handled automatically through filteredBooks$
    });
  }

  private loadInitialData(): void {
    this.loading = true;
    this.bookService.getBooks()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (books) => {
          this.booksSubject$.next(books);
          this.loadGenres();
        },
        error: (error) => {
          this.error = 'Failed to load books. Please try again later.';
          console.error('Error loading books:', error);
        }
      });
  }

  private filterAndSortBooks(
    books: Book[], 
    search: string, 
    genre: string, 
    sort: string
  ): Book[] {
    let filtered = [...books];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower)
      );
    }

    if (genre) {
      filtered = filtered.filter((book) => book.genre === genre);
    }

    return this.sortBooks(filtered, sort);
  }

  private sortBooks(books: Book[], sortBy: string): Book[] {
    return [...books].sort((a, b) => {
      switch (sortBy) {
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
  }

  loadGenres(): void {
    try {
      this.genres = this.bookService.getGenres();
    } catch (error) {
      console.error('Error loading genres:', error);
      this.error = 'Failed to load genres. Please try again later.';
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchInput?.nativeElement?.focus();
  }

  toggleGenreDropdown(): void {
    this.showGenreDropdown = !this.showGenreDropdown;
    this.showSortDropdown = false;
  }

  toggleSortDropdown(): void {
    this.showSortDropdown = !this.showSortDropdown;
    this.showGenreDropdown = false;
  }

  borrowBook(book: Book): void {
    if (!book || book.copies <= 0 || this.borrowingBooks.has(book.id)) {
      return;
    }

    this.borrowingBooks.add(book.id);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    
    const newBorrow: Borrow = {
      id: '',
      book: book,
      borrower: {
        name: 'Test User' // TODO: Replace with actual user when auth is implemented
      },
      borrowDate: new Date().toISOString(),
      dueDate: dueDate.toISOString(),
      status: 'Borrowed'
    };

    this.borrowService.addBorrow(newBorrow)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          const updatedBook = { ...book, copies: book.copies - 1 };
          return this.bookService.updateBook(updatedBook);
        }),
        finalize(() => this.borrowingBooks.delete(book.id))
      )
      .subscribe({
        next: (updatedBook) => {
          const currentBooks = this.booksSubject$.value;
          const updatedBooks = currentBooks.map(b => 
            b.id === updatedBook.id ? updatedBook : b
          );
          this.booksSubject$.next(updatedBooks);
          alert('Book borrowed successfully!');
        },
        error: (error) => {
          console.error('Error in borrow process:', error);
          alert('Failed to borrow book. Please try again.');
        }
      });
  }

  isBorrowing(bookId: string): boolean {
    return this.borrowingBooks.has(bookId);
  }

  trackById(_: number, book: Book): string {
    return book.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}