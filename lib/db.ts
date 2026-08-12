import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export interface Card {
  id: number;
  slug: string;
  target_url: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  cta_type: string;
  hide_text: number;
  created_at: string;
}

export interface Click {
  id: number;
  card_id: number;
  user_agent: string | null;
  ip_address: string | null;
  device_type: string | null;
  referrer: string | null;
  created_at: string;
}

export interface CardStats {
  card: Card;
  total_clicks: number;
  unique_clicks: number;
  device_breakdown: Record<string, number>;
  referrer_breakdown: Record<string, number>;
  recent_clicks: Click[];
}

export interface CardWithClicks extends Card {
  total_clicks: number;
}

import os from 'os';

function getDbPath(): string {
  if (process.env.DATABASE_PATH) return process.env.DATABASE_PATH;
  const primary = path.join(process.cwd(), 'piclink.db');
  try {
    const testFile = path.join(process.cwd(), `.test_db_${Date.now()}`);
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return primary;
  } catch (e) {
    return path.join(os.tmpdir(), 'piclink.db');
  }
}

const DB_PATH = getDbPath();

let dbInstance: Database.Database | null = null;

function initDb(db: Database.Database): void {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      target_url TEXT NOT NULL,
      title TEXT,
      description TEXT,
      image_url TEXT,
      cta_type TEXT DEFAULT 'none',
      hide_text INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    db.exec(`ALTER TABLE cards ADD COLUMN hide_text INTEGER DEFAULT 0`);
  } catch (e) {
    // column already exists
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id INTEGER NOT NULL,
      user_agent TEXT,
      ip_address TEXT,
      device_type TEXT,
      referrer TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
    );
  `);
}

export function getDb(): Database.Database {
  if (!dbInstance) {
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    dbInstance = new Database(DB_PATH);
    initDb(dbInstance);
  }
  return dbInstance;
}

export function createCard(data: {
  slug: string;
  target_url: string;
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
  cta_type?: string;
  hide_text?: number;
}): Card {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO cards (slug, target_url, title, description, image_url, cta_type, hide_text)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    data.slug,
    data.target_url,
    data.title ?? null,
    data.description ?? null,
    data.image_url ?? null,
    data.cta_type ?? 'none',
    data.hide_text ?? 0
  );

  const card = getCardBySlug(data.slug);
  if (!card) {
    throw new Error(`Failed to retrieve newly created card with slug: ${data.slug}`);
  }
  return card;
}

export function getCardBySlug(slug: string): Card | null {
  const db = getDb();
  const stmt = db.prepare(`SELECT * FROM cards WHERE slug = ?`);
  const row = stmt.get(slug) as Card | undefined;
  return row ?? null;
}

export function logClick(data: {
  card_id: number;
  user_agent?: string | null;
  ip_address?: string | null;
  device_type?: string | null;
  referrer?: string | null;
}): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO clicks (card_id, user_agent, ip_address, device_type, referrer)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(
    data.card_id,
    data.user_agent ?? null,
    data.ip_address ?? null,
    data.device_type ?? null,
    data.referrer ?? null
  );
}

export function getAllCards(): Card[] {
  const db = getDb();
  const stmt = db.prepare(`SELECT * FROM cards ORDER BY id DESC`);
  return stmt.all() as Card[];
}

export function getAllCardsWithClicks(): CardWithClicks[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT c.*, COUNT(cl.id) as total_clicks
    FROM cards c
    LEFT JOIN clicks cl ON c.id = cl.card_id
    GROUP BY c.id
    ORDER BY c.id DESC
  `);
  return stmt.all() as CardWithClicks[];
}

export function updateCardTarget(id: number, target_url: string): boolean {
  const db = getDb();
  const stmt = db.prepare(`UPDATE cards SET target_url = ? WHERE id = ?`);
  const info = stmt.run(target_url, id);
  return info.changes > 0;
}

export function deleteCard(id: number): boolean {
  const db = getDb();
  const stmt = db.prepare(`DELETE FROM cards WHERE id = ?`);
  const info = stmt.run(id);
  return info.changes > 0;
}

export function getCardStats(id: number): CardStats | null {
  const db = getDb();
  const cardStmt = db.prepare(`SELECT * FROM cards WHERE id = ?`);
  const card = cardStmt.get(id) as Card | undefined;

  if (!card) {
    return null;
  }

  const countStmt = db.prepare(`SELECT COUNT(*) as count FROM clicks WHERE card_id = ?`);
  const totalClicksResult = countStmt.get(id) as { count: number };
  const total_clicks = totalClicksResult ? totalClicksResult.count : 0;

  const uniqueStmt = db.prepare(`SELECT COUNT(DISTINCT ip_address) as count FROM clicks WHERE card_id = ? AND ip_address IS NOT NULL`);
  const uniqueClicksResult = uniqueStmt.get(id) as { count: number };
  const unique_clicks = uniqueClicksResult ? uniqueClicksResult.count : 0;

  const deviceStmt = db.prepare(`
    SELECT COALESCE(device_type, 'Desktop/Other') as device, COUNT(*) as count
    FROM clicks
    WHERE card_id = ?
    GROUP BY device
  `);
  const deviceRows = deviceStmt.all(id) as { device: string; count: number }[];
  const device_breakdown: Record<string, number> = {};
  for (const row of deviceRows) {
    device_breakdown[row.device] = row.count;
  }

  const referrerStmt = db.prepare(`
    SELECT COALESCE(NULLIF(referrer, ''), 'Direct / Unknown') as ref, COUNT(*) as count
    FROM clicks
    WHERE card_id = ?
    GROUP BY ref
  `);
  const referrerRows = referrerStmt.all(id) as { ref: string; count: number }[];
  const referrer_breakdown: Record<string, number> = {};
  for (const row of referrerRows) {
    referrer_breakdown[row.ref] = row.count;
  }

  const recentStmt = db.prepare(`
    SELECT * FROM clicks
    WHERE card_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `);
  const recent_clicks = recentStmt.all(id) as Click[];

  return {
    card,
    total_clicks,
    unique_clicks,
    device_breakdown,
    referrer_breakdown,
    recent_clicks,
  };
}
