import * as SQLite from 'expo-sqlite';

export const DB_NAME = 'wasalha.db';

export const db = SQLite.openDatabaseSync(DB_NAME);
db.execSync('PRAGMA journal_mode = WAL;');
db.execSync('PRAGMA foreign_keys = ON;');