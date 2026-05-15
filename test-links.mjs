import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

const DEFAULT_VAULT = 'labart-Apr 2026';
const VAULT_ROOT = '/Users/isaac.LBS.assistant/Obsidian/labart-Apr 2026';
const BASE = 'https://labartw.github.io/obsidian-redirect/';

function buildObsidianUri(params) {
  const path = params.get('path');
  const vault = params.get('vault');
  const file = params.get('file') || params.get('filepath');
  const dailyDiary = params.get('daily_diary');
  if (dailyDiary) return 'obsidian://open?vault=' + encodeURIComponent(DEFAULT_VAULT) + '&file=' + encodeURIComponent('_Isaac/Daily Diary/' + dailyDiary + ' - Daily Diary.md');
  if (path) return 'obsidian://open?path=' + encodeURIComponent(path);
  if (vault && file) return 'obsidian://open?vault=' + encodeURIComponent(vault) + '&file=' + encodeURIComponent(file);
  return '';
}

function httpsForFile(file) {
  const u = new URL(BASE);
  u.searchParams.set('vault', DEFAULT_VAULT);
  u.searchParams.set('file', file);
  return u.toString();
}

function expectedForFile(file) {
  return 'obsidian://open?vault=' + encodeURIComponent(DEFAULT_VAULT) + '&file=' + encodeURIComponent(file);
}

const cases = [
  {
    name: 'daily diary shortcut',
    url: BASE + '?daily_diary=2026-05-15',
    expected: expectedForFile('_Isaac/Daily Diary/2026-05-15 - Daily Diary.md'),
    exists: VAULT_ROOT + '/_Isaac/Daily Diary/2026-05-15 - Daily Diary.md',
  },
  {
    name: 'filed note nested path',
    url: httpsForFile('_Isaac/Filed/Notes/2026-05-10 - AI project failure modes.md'),
    expected: expectedForFile('_Isaac/Filed/Notes/2026-05-10 - AI project failure modes.md'),
    exists: VAULT_ROOT + '/_Isaac/Filed/Notes/2026-05-10 - AI project failure modes.md',
  },
  {
    name: 'operating standard deep nested path',
    url: httpsForFile('_Isaac/Isaac Core/Operating Standards/Obsidian Filing Contract.md'),
    expected: expectedForFile('_Isaac/Isaac Core/Operating Standards/Obsidian Filing Contract.md'),
    exists: VAULT_ROOT + '/_Isaac/Isaac Core/Operating Standards/Obsidian Filing Contract.md',
  },
  {
    name: 'absolute path fallback',
    url: BASE + '?path=' + encodeURIComponent(VAULT_ROOT + '/_Isaac/Daily Diary/2026-05-15 - Daily Diary.md'),
    expected: 'obsidian://open?path=' + encodeURIComponent(VAULT_ROOT + '/_Isaac/Daily Diary/2026-05-15 - Daily Diary.md'),
    exists: VAULT_ROOT + '/_Isaac/Daily Diary/2026-05-15 - Daily Diary.md',
  },
  {
    name: 'ambiguous file-only rejected',
    url: BASE + '?file=' + encodeURIComponent('2026-05-15 - Daily Diary.md'),
    expected: '',
  },
];

for (const c of cases) {
  if (c.exists) assert.equal(existsSync(c.exists), true, `${c.name}: fixture exists`);
  const url = new URL(c.url);
  const actual = buildObsidianUri(url.searchParams);
  assert.equal(actual, c.expected, c.name);
  console.log(`PASS ${c.name}`);
  console.log(`  ${c.url}`);
  console.log(`  ${actual || '[rejected as expected]'}`);
}
