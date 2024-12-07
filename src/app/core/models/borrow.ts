export interface Borrow {
    id: number;
    bookTitle: string;
    userId: number;
    borrowDate: string;
    returnDate: string;
    status: 'Borrowed' | 'Returned';
  }
  