import * as Crypto from "expo-crypto";

export const init_Payment_Tables = async (db: any) => {
  try {
    await db.execAsync(`
            CREATE TABLE IF NOT EXISTS Payments (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                payment_method_id TEXT,
                ride_id TEXT DEFAULT NULL,
                lesson_booking_id TEXT DEFAULT NULL,
                amount REAL NOT NULL,
                currency TEXT NOT NULL DEFAULT 'EGP',
                method TEXT NOT NULL CHECK (method IN ('card', 'cash', 'wallet')),
                status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
                gateway_ref TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id),
                FOREIGN KEY (payment_method_id) REFERENCES Payment_methods(id)
            );

            CREATE TABLE IF NOT EXISTS Payment_Methods (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                type TEXT NOT NULL CHECK (type IN ('cash', 'wallet', 'card')),
                network TEXT CHECK (network IN ('Visa', 'MasterCard', 'Meeza')),
                provider TEXT,
                last_four TEXT,
                is_default INTEGER DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id)
            );

            CREATE TABLE IF NOT EXISTS Promotions (
                id TEXT PRIMARY KEY,
                code TEXT NOT NULL UNIQUE,
                discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
                discount_value REAL NOT NULL,
                max_uses INTEGER,
                uses_count INTEGER DEFAULT 0,
                valid_from TEXT NOT NULL,
                valid_until TEXT NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP  
            );
        `);
  } catch (e) {
    console.error("Error initializing payments tables:", e);
    throw e;
  }
};

export const getPaymentMethods = async (db: any, userId: string) => {
  return db.getAllAsync(
    "SELECT * FROM Payment_Methods WHERE user_id = ? ORDER BY is_default DESC, created_at DESC;",
    [userId],
  );
};

export const addPaymentMethod = async (
  db: any,
  userId: string,
  network: "Visa" | "MasterCard" | "Meeza",
  provider: string,
  lastFour: string,
) => {
  const id = Crypto.randomUUID();
  await db.runAsync(
    "INSERT INTO Payment_Methods (id, user_id, tyoe, network, provider, last_four) VALUES (?, ?, 'card', ?, ?, ?);",
    [id, userId, network, provider, lastFour],
  );
  return id;
};

export const setDefaultMethod = async (
  db: any,
  userId: string,
  methodId: string,
) => {
  await db.runAsync(
    "UPDATE Payment_Methods SET is_default = 0 WHERE user_id = ?;",
    [userId],
  );
  await db.runAsync("UPDATE Payment_Methods SET is_default = 1 WHERE id = ?;", [
    methodId,
  ]);
};

export const seedDefaultMethods = async (db: any, userId: string) => {
  const cashId = Crypto.randomUUID();
  const walletId = Crypto.randomUUID();

  await db.runAsync(
    "INSERT INTO Payment_Methods (id, user_id, type) VALUES (?, ?, 'cash');",
    [cashId, userId],
  );
  await db.runAsync(
    "INSERT INTO Payment_Methods (id, user_id, type) VALUES (?, ?, 'wallet');",
    [walletId, userId],
  );
};
