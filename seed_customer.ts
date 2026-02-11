
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf8');
      envConfig.split('\n').forEach((line) => {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      });
    }
  } catch (error) {
    console.error('Error loading .env.local', error);
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const email = 'admin_e2e_1770709219279@example.com';
  const password = 'password123';

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error('Error logging in:', authError);
    process.exit(1);
  }

  console.log('Logged in:', authData.user?.id);

  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      name: 'E2E Customer',
      email: 'customer_e2e@example.com',
      phone: '1234567890',
      status: 'active',
      tier: 'Standard'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    process.exit(1);
  }

  console.log(`Customer created: ${customer.id}`);
}

main().catch(console.error);
