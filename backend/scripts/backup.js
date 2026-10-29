const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = process.env.SQLITE_STORAGE_PATH || path.join(__dirname, '..', 'elarix.sqlite');
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups');

function runBackup() {
  console.log('========================================================');
  console.log('       ELARIX PRODUCTION DATABASE BACKUP UTILITY        ');
  console.log('========================================================\n');

  if (!fs.existsSync(DB_PATH)) {
    console.error(`[ERROR] Database file not found at: ${DB_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`[INIT] Created backup directory at: ${BACKUP_DIR}`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `elarix_backup_${timestamp}.sqlite`;
  const backupFilePath = path.join(BACKUP_DIR, backupFileName);

  // Synchronously copy file
  fs.copyFileSync(DB_PATH, backupFilePath);
  const stats = fs.statSync(backupFilePath);
  const sizeKB = (stats.size / 1024).toFixed(2);

  console.log(`[SUCCESS] Database snapshot created:`);
  console.log(`  File: ${backupFileName}`);
  console.log(`  Path: ${backupFilePath}`);
  console.log(`  Size: ${sizeKB} KB`);

  // Verify SQLite Integrity
  const db = new sqlite3.Database(backupFilePath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('[ERROR] Could not open backup for verification:', err.message);
      process.exit(1);
    }
  });

  db.get('PRAGMA integrity_check;', (err, row) => {
    if (err) {
      console.error('[ERROR] Integrity check failed:', err.message);
      db.close();
      process.exit(1);
    }

    const result = row.integrity_check;
    if (result === 'ok') {
      console.log(`  Integrity Check: PASSED ("${result}")\n`);
      console.log('--------------------------------------------------------');
      console.log('Restoration Instruction:');
      console.log(`To restore, copy "${backupFileName}" to "backend/elarix.sqlite".`);
      console.log('--------------------------------------------------------\n');
      db.close();
    } else {
      console.error(`[WARNING] Database integrity reported issues: ${result}`);
      db.close();
      process.exit(1);
    }
  });
}

runBackup();
