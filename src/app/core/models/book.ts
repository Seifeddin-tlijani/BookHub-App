export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  copies: number;
  imageUrl: string;
  description?: string;
  isbn?: string;
  publisher?: string;
  language?: string;
  pages?: number;
  tags?: string[];
}