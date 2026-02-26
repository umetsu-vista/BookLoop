import type { Database } from '../db/index';
import { BookService } from './book';
import { BookshelfService } from './bookshelf';
import { SessionService } from './session';
import { StreakService } from './streak';
import { StatsService } from './stats';
import { NoteService } from './note';

export interface Services {
  book: BookService;
  bookshelf: BookshelfService;
  session: SessionService;
  streak: StreakService;
  stats: StatsService;
  note: NoteService;
}

export function createServices(db: Database): Services {
  const streak = new StreakService(db);
  const session = new SessionService(db, streak);
  const book = new BookService(db);
  const bookshelf = new BookshelfService(db);
  const stats = new StatsService(db);
  const note = new NoteService(db);

  return { book, bookshelf, session, streak, stats, note };
}
