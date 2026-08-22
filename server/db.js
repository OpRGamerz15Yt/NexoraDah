import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { env } from './env.js';

fs.mkdirSync(path.dirname(env.databasePath), { recursive: true });
export const db = new Database(env.databasePath);
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS guild_settings (guild_id TEXT PRIMARY KEY, settings TEXT NOT NULL DEFAULT '{}', updated_at TEXT NOT NULL)`);
export function getGuildSettings(guildId) { const row = db.prepare('SELECT settings, updated_at FROM guild_settings WHERE guild_id = ?').get(guildId); return row ? { ...JSON.parse(row.settings), updatedAt: row.updated_at } : null; }
export function saveGuildSettings(guildId, settings) { const now = new Date().toISOString(); db.prepare('INSERT INTO guild_settings (guild_id, settings, updated_at) VALUES (?, ?, ?) ON CONFLICT(guild_id) DO UPDATE SET settings=excluded.settings, updated_at=excluded.updated_at').run(guildId, JSON.stringify(settings), now); return { ...settings, updatedAt: now }; }