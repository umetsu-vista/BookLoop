import type { BookSource, BookStatus, Genre } from '../constants/index';

export interface Book {
  id: string;
  isbn: string | null;
  title: string;
  author: string | null;
  publisher: string | null;
  coverUrl: string | null;
  totalPages: number | null;
  description: string | null;
  genre: Genre;
  publishedAt: string | null;
  source: BookSource;
  fetchedAt: string | null;
  createdAt: string;
}

export interface UserBook {
  id: string;
  userId: string;
  bookId: string;
  status: BookStatus;
  currentPage: number;
  rating: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookshelfItem {
  id: string;
  book: Book;
  status: BookStatus;
  currentPage: number;
  progress: number;
  updatedAt: string;
}

export interface CreateManualBookRequest {
  title: string;
  author?: string;
  totalPages?: number;
}

export interface AddToBookshelfRequest {
  bookId: string;
  status?: BookStatus;
}

export interface UpdateBookshelfRequest {
  status?: BookStatus;
  currentPage?: number;
  rating?: number;
}

export interface SearchBooksQuery {
  q: string;
  type: 'isbn' | 'keyword';
}
