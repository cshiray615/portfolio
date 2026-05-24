#!/usr/bin/env node
/**
 * Move any file in public/ over the Cloudflare Workers asset cap (25 MiB)
 * into _pending/ so the build doesn't fail. Preserves the relative path
 * so the original can be dropped back in once it's been resized.
 *
 * Runs automatically before `npm run build` via the `prebuild` script.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const MAX_BYTES = 25 * 1024 * 1024; // Cloudflare Workers per-asset limit
const PUBLIC_DIR = path.join(ROOT, 'public');
const PENDING_DIR = path.join(ROOT, '_pending');

const moved = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile()) {
      const { size } = fs.statSync(full);
      if (size > MAX_BYTES) {
        const rel = path.relative(PUBLIC_DIR, full);
        const target = path.join(PENDING_DIR, rel);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        // If a file with the same path is already in _pending/, overwrite it
        // so we don't accumulate duplicates from repeated builds.
        if (fs.existsSync(target)) fs.rmSync(target);
        fs.renameSync(full, target);
        moved.push({ rel, size });
      }
    }
  }
}

walk(PUBLIC_DIR);

if (moved.length > 0) {
  console.warn('');
  console.warn('⚠️  Oversize asset(s) quarantined (Cloudflare Workers caps assets at 25 MB):');
  for (const { rel, size } of moved) {
    const mb = (size / 1024 / 1024).toFixed(1);
    console.warn(`   • public/${rel} → _pending/${rel}  (${mb} MB)`);
  }
  console.warn('');
  console.warn('   Resize or re-export at lower resolution / JPEG quality, then move the file');
  console.warn('   back into public/ at the same path. _pending/ is gitignored.');
  console.warn('');
}
