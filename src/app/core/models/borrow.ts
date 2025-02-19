import { Book } from './book';

export interface Borrow {
  id: string;
  book: {
    id: string;
    title: string;
    author: string;
    imageUrl?: string;
  };
  borrower: {
    name: string;
    email: string;
  };
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: string;
}