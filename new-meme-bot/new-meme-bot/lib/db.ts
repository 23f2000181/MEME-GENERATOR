/**
 * SQLite Database Setup
 *
 * This module prepares the database schema for future use.
 * Currently not enforced in the application, but ready for when needed.
 */

import Database from 'better-sqlite3';
import path from 'path';

// Database file location
const DB_PATH = path.join(process.cwd(), 'memes.db');

/**
 * Initialize database and create tables
 */
export function initializeDatabase() {
  const db = new Database(DB_PATH);

  // Create users table (for future authentication)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      api_usage INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create memes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS memes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      mode VARCHAR(10) NOT NULL CHECK(mode IN ('auto', 'manual')),
      user_input TEXT NOT NULL,
      generated_prompt TEXT,
      image_path TEXT,
      image_data TEXT,
      metadata JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create index for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_memes_user_id ON memes(user_id);
    CREATE INDEX IF NOT EXISTS idx_memes_created_at ON memes(created_at);
  `);

  db.close();
  console.log('Database initialized successfully');
}

/**
 * Get database connection
 */
export function getDatabase() {
  return new Database(DB_PATH);
}

/**
 * Save a generated meme to the database
 */
export interface SaveMemeParams {
  userId?: number;
  mode: 'auto' | 'manual';
  userInput: string;
  generatedPrompt?: string;
  imagePath?: string;
  imageData?: string;
  metadata?: any;
}

export function saveMeme(params: SaveMemeParams) {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO memes (user_id, mode, user_input, generated_prompt, image_path, image_data, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    params.userId || null,
    params.mode,
    params.userInput,
    params.generatedPrompt || null,
    params.imagePath || null,
    params.imageData || null,
    JSON.stringify(params.metadata || {})
  );

  db.close();
  return result.lastInsertRowid;
}

/**
 * Get all memes for a user
 */
export function getUserMemes(userId: number, limit = 50) {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM memes
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);

  const memes = stmt.all(userId, limit);
  db.close();

  return memes;
}

/**
 * Get recent memes (for public gallery)
 */
export function getRecentMemes(limit = 20) {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT id, mode, user_input, generated_prompt, image_data, metadata, created_at
    FROM memes
    ORDER BY created_at DESC
    LIMIT ?
  `);

  const memes = stmt.all(limit);
  db.close();

  return memes;
}

/**
 * Update user API usage count
 */
export function updateUserUsage(userId: number, increment = 1) {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE users
    SET api_usage = api_usage + ?
    WHERE id = ?
  `);

  stmt.run(increment, userId);
  db.close();
}

// Initialize database on module load
initializeDatabase();

export default {
  initializeDatabase,
  getDatabase,
  saveMeme,
  getUserMemes,
  getRecentMemes,
  updateUserUsage,
};
