import * as Crypto from "expo-crypto";

export const init_Location_Tables = async (db: any) => {
  try {
    await db.execAsync(`
            CREATE TABLE IF NOT EXISTS Saved_Destinations (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                label TEXT NOT NULL,
                address TEXT NOT NULL,
                lat REAL NOT NULL,
                lng REAL NOT NULL,
                icon TEXT,
                use_count INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id)
            );

            CREATE TABLE IF NOT EXISTS Recent_Destinations (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                address TEXT NOT NULL,
                lat REAL NOT NULL,
                lng REAL NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id)
            );
        `);
  } catch (e) {
    console.error("Error initializing location tables:", e);
    throw e;
  }
};

export const addSavedDestinations = async (
  db: any,
  userId: string,
  label: string,
  address: string,
  lat: number,
  lng: number,
  icon?: string,
) => {
  const id = Crypto.randomUUID();

  await db.runAsync(
    `INSERT INTO Saved_Destinations (id, user_id, label, address, lat, lng, icon) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, label, address, lat, lng, icon || null],
  );
  return id;
};

export const getSavedDestinations = async (db: any, userId: string) => {
  return db.getAllAsync(
    `SELECT * FROM Saved_Destinations WHERE user_id = ? ORDER BY use_count DESC, created_at DESC`,
    [userId],
  );
};

export const deleteSavedDestination = async (db: any, id: string) => {
  await db.runAsync(`DELETE FROM Saved_Destinations WHERE id = ?`, [id]);
};

export const incrementSavedDestinationUseCount = async (
  db: any,
  id: string,
) => {
  await db.runAsync(
    `UPDATE Saved_Destinations SET use_count = use_count + 1 WHERE id = ?`,
    [id],
  );
};

export const addRecentDestination = async (
  db: any,
  userId: string,
  address: string,
  lat: number,
  lng: number,
) => {
  const id = Crypto.randomUUID();

  await db.runAsync(
    `INSERT INTO Recent_Destinations (id, user_id, address, lat, lng) VALUES (?, ?, ?, ?, ?)`,
    [id, userId, address, lat, lng],
  );
  await db.runAsync(
    `DELETE FROM Recent_Destinations WHERE user_id = ? AND id NOT IN (SELECT id FROM Recent_Destinations WHERE user_id = ? ORDER BY created_at DESC LIMIT 5)`,
    [userId, userId],
  );
};

export const getRecentDestinations = async (db: any, userId: string) => {
  return db.getAllAsync(
    `SELECT * FROM Recent_Destinations WHERE user_id = ? ORDER BY created_at DESC`,
    [userId],
  );
};
