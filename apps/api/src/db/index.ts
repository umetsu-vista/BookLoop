import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

export type Database = ReturnType<typeof createDatabase>;
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
export type DbClient = Database | Transaction;

export function createDatabase(url: string, authToken?: string) {
  const client = createClient({
    url,
    authToken,
  });
  return drizzle(client, { schema });
}
