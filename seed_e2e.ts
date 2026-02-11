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
  const email = `admin_e2e_${Date.now()}@example.com`;
  const password = 'password123';

  console.log(`Creating user: ${email}`);

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('Error creating user:', authError);
    process.exit(1);
  }

  console.log('User created:', authData.user?.id);

  const { data: packageData, error: packageError } = await supabase
    .from('packages')
    .insert({
      name: 'E2E Test Package',
      description: 'A package for E2E testing',
      destination: 'Test Destination',
      duration: '1 Day',
      base_price: 1000,
      max_pax: 10,
      status: 'published',
      category: 'Adventure',
      image_urls: ['https://example.com/image.jpg'],
      options: [
        { name: 'Standard', price: 1000, times: [], tiers: [] }
      ]
    })
    .select()
    .single();

  if (packageError) {
    console.error('Error creating package:', packageError);
    process.exit(1);
  }

  console.log(`Package created: ${packageData.id}`);
  
  console.log(`JSON_OUTPUT: {"email": "${email}", "password": "${password}", "packageId": "${packageData.id}"}`);
}

main().catch(console.error);