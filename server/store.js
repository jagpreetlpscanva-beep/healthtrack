import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DATA = path.join(here, 'data');
export const UPLOADS = path.join(here, 'uploads');
const FILE = path.join(DATA, 'db.json');
const empty = () => ({ documents: [], tests: [], meds: [], dx: [], events: [], abha: { number: '', linked: false } });
const supabaseConfig = () => ({ url: process.env.SUPABASE_URL?.replace(/\/$/, ''), key: process.env.SUPABASE_SERVICE_ROLE_KEY });

async function supabaseRequest(pathname, options = {}) {
  const { url, key } = supabaseConfig();
  if (!url || !key) throw new Error('Persistent storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.');
  const response = await fetch(`${url}/rest/v1/${pathname}`, {
    ...options,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal', ...options.headers },
  });
  if (!response.ok) throw new Error(`Database request failed (${response.status}). Check the Supabase table and server credentials.`);
  return response.status === 204 ? null : response.json().catch(() => null);
}

export const load = async () => {
  if (process.env.VERCEL === '1' || (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    const rows = await supabaseRequest('medimind_state?id=eq.main&select=state');
    return rows?.[0]?.state ? { ...empty(), ...rows[0].state } : empty();
  }
  try { return { ...empty(), ...JSON.parse(fs.readFileSync(FILE, 'utf8')) }; } catch { return empty(); }
};

export const save = async db => {
  if (process.env.VERCEL === '1' || (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    await supabaseRequest('medimind_state?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ id: 'main', state: db, updated_at: new Date().toISOString() }),
    });
    return;
  }
  fs.mkdirSync(DATA, { recursive: true });
  fs.writeFileSync(FILE + '.tmp', JSON.stringify(db, null, 2));
  fs.renameSync(FILE + '.tmp', FILE);
};
