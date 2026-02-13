import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;

  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const value = line.trim();
    if (!value || value.startsWith('#') || !value.includes('=')) continue;
    const idx = value.indexOf('=');
    const key = value.slice(0, idx).trim();
    const envValue = value.slice(idx + 1).trim();
    if (key) process.env[key] = envValue;
  }
}

function parseArgs(argv) {
  const args = { userId: '', email: '', role: '' };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const next = argv[i + 1];

    if (token === '--user-id' && next) {
      args.userId = next;
      i += 1;
      continue;
    }

    if (token === '--email' && next) {
      args.email = next;
      i += 1;
      continue;
    }

    if (token === '--role' && next) {
      args.role = next;
      i += 1;
    }
  }

  return args;
}

async function findUserIdByEmail(supabase, email) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`listUsers failed: ${error.message}`);

    const users = data?.users ?? [];
    const matched = users.find((user) => (user.email || '').toLowerCase() === email.toLowerCase());
    if (matched?.id) return matched.id;

    if (users.length < perPage) return null;
    page += 1;
  }
}

async function main() {
  loadEnv();

  const { userId: rawUserId, email: rawEmail, role: rawRole } = parseArgs(process.argv.slice(2));
  const role = String(rawRole || '').trim().toLowerCase();

  if (!['admin', 'editor', 'customer'].includes(role)) {
    throw new Error('Invalid --role. Use one of: admin, editor, customer');
  }

  if (!rawUserId && !rawEmail) {
    throw new Error('Provide --user-id or --email');
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const userId = rawUserId || (await findUserIdByEmail(supabase, rawEmail));
  if (!userId) {
    throw new Error('User not found');
  }

  const { data: userData, error: getError } = await supabase.auth.admin.getUserById(userId);
  if (getError) throw new Error(`getUserById failed: ${getError.message}`);

  const currentMeta = (userData?.user?.user_metadata ?? {});
  const nextMeta = {
    ...currentMeta,
    backoffice_role: role,
  };

  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: nextMeta,
  });

  if (updateError) throw new Error(`updateUserById failed: ${updateError.message}`);

  console.log(`Updated role for user ${userId} -> ${role}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
