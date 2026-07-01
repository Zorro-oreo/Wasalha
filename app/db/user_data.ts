import { db } from './db';

export const init_User_Tables = async () => {
    try{

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS Users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                Fname TEXT NOT NULL,
                Mname TEXT,
                Lname TEXT NOT NULL,
                Pnum TEXT NOT NULL UNIQUE,
                profile_pic_url TEXT,
                DOB TEXT NOT NULL,
                nat_id TEXT UNIQUE,
                nat_id_verified INTEGER DEFAULT 0,
                nat_id_pic_url TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                Gender TEXT CHECK (Gender IN ('Female', 'Other')),
                is_active INTEGER DEFAULT 1,
                preferred_lang TEXT DEFAULT 'en' CHECK (preferred_lang IN ('en', 'ar')),
                is_deleted INTEGER DEFAULT 0
            );
    
            CREATE TABLE IF NOT EXISTS User_Roles (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('Rider', 'Driver', 'Instructor')),
                is_active INTEGER DEFAULT 1,
                activated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id)
            );
    
            CREATE TABLE IF NOT EXISTS Accounts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('Rider', 'Driver', 'Instructor')),
                rating REAL DEFAULT 5.00,
                rating_count INTEGER DEFAULT 0,
                bio TEXT,
                is_online INTEGER DEFAULT 0,
                total_rides INTEGER DEFAULT 0,
                total_earnings REAL DEFAULT 0.00,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id)
            );
        `);
    } catch (e) {
        console.error('Error initializing user tables:', e);
        throw e;
    }
};