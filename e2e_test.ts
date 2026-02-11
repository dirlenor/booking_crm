import { chromium } from 'playwright';
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

const PACKAGE_ID = '1e626710-5835-4b8e-94e2-a63318891071';
const USER_EMAIL = 'admin_e2e_1770709219279@example.com';
const USER_PASS = 'password123';
const CUSTOMER_ID = '1e3b9faf-9eb2-4c68-a853-21bc85305888';
const TARGET_DATE = '2026-02-25';
const TARGET_TIME = '09:00';

async function run() {
  console.log('Starting E2E Test...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  try {
    console.log('Logging in...');
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', USER_EMAIL);
    await page.fill('input[type="password"]', USER_PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    console.log('Logged in successfully.');

    console.log('Logging in to Supabase Client...');
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: USER_EMAIL,
        password: USER_PASS
    });
    if (signInError) {
        console.error('Supabase Client Login Failed:', signInError);
        throw signInError;
    }

    const { error: updateError } = await supabase
        .from('packages')
        .update({
            options: [{ id: 'opt-1', name: 'Standard', price: 1000, times: [TARGET_TIME], tiers: [] }]
        })
        .eq('id', PACKAGE_ID);
        
    if (updateError) console.error('Error seeding options:', updateError);

    console.log('Navigating to Edit Package...');
    await page.goto(`http://localhost:3000/packages/${PACKAGE_ID}/edit`);
    await page.screenshot({ path: 'debug-step-edit-load.png' });
    
    console.log('Switching to Trips tab...');
    await page.click('button:has-text("Trips")');
    await page.screenshot({ path: 'debug-step-trips-tab.png' });
    
    console.log('Selecting date 25...');
    const dateBtn = page.locator('button', { hasText: /^25$/ }).first();
    if (await dateBtn.isVisible()) {
        await dateBtn.click({ force: true });
        console.log('Clicked date 25');
    } else {
        console.error('Date 25 not visible!');
    }
    await page.screenshot({ path: 'debug-step-date-selected.png' });
    
    console.log('Saving package...');
    await page.click('button:has-text("Save Changes")');
    
    try {
        await page.waitForURL('**/packages', { timeout: 10000 });
        console.log('Navigated to /packages successfully');
    } catch (e) {
        console.log('Did not navigate to /packages. Checking for errors...');
        await page.screenshot({ path: 'debug-save-failed.png' });
        const errorMsg = await page.locator('.text-destructive').textContent().catch(() => null);
        if (errorMsg) console.error('Save Error:', errorMsg);
    }
    
    console.log('Verifying Trips in DB...');
    const { data: trips } = await supabase
        .from('trips')
        .select('*')
        .eq('package_id', PACKAGE_ID)
        .eq('date', TARGET_DATE)
        .eq('time', TARGET_TIME);
        
    if (!trips || trips.length === 0) {
        throw new Error('Trip sync failed! No trip found in DB.');
    }
    console.log('Trip found:', trips[0].id);
    const TRIP_ID = trips[0].id;
    
    console.log('Navigating to Public Destination...');
    await page.goto(`http://localhost:3000/destinations/${PACKAGE_ID}`);
    
    console.log('Selecting Date...');
    await page.click('button:has-text("Choose Date")');
    await page.click(`button:has-text("25")`); 
    
    console.log('Selecting Option...');
    await page.click('text=Standard');
    
    console.log('Selecting Time...');
    await page.click(`button:has-text("${TARGET_TIME}")`);
    
    const checkBtn = await page.$('button:has-text("Check Availability")');
    if (checkBtn) {
        console.log('Clicking Check Availability...');
        await checkBtn.click();
        await page.waitForSelector('text=Great news!', { timeout: 5000 }).catch(() => console.log('Success message not found immediately'));
    }
    
    console.log('Adding to Cart...');
    await page.click('#drawer-add-to-cart-btn');
    
    await page.waitForSelector('text=Added to cart');
    console.log('Added to cart successfully.');
    
    console.log('Navigating to Create Booking...');
    await page.goto('http://localhost:3000/bookings/create');
    
    console.log('Step 1: Selecting Customer...');
    await page.click('text=E2E Customer');
    await page.click('button:has-text("Next")');
    
    console.log('Step 2: Selecting Package/Trip...');
    await page.click('text=E2E Test Package');
    
    await page.click('button:has-text("Pick a date")');
    await page.click(`button:has-text("25")`);
    
    await page.click('text=09:00');
    
    await page.click('button:has-text("Next")');
    
    console.log('Step 3: Passengers...');
    const nameInputs = page.locator('input[placeholder="Full Name"]');
    if (await nameInputs.count() > 0) await nameInputs.nth(0).fill('Passenger 1');
    if (await nameInputs.count() > 1) await nameInputs.nth(1).fill('Passenger 2');
    
    await page.click('button:has-text("Next")');
    
    console.log('Step 4: Confirming...');
    await page.click('button:has-text("Confirm Booking")');
    
    await page.waitForURL('**/bookings');
    console.log('Booking created successfully.');
    
    console.log('Verifying DB Consistency...');
    const { data: booking } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', CUSTOMER_ID)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
    if (!booking) throw new Error('Booking not found in DB');
    
    console.log('Booking ID:', booking.id);
    console.log('Trip ID:', booking.trip_id);
    console.log('Pax:', booking.pax);
    console.log('Total:', booking.total_amount);
    
    if (booking.trip_id !== TRIP_ID) throw new Error(`Trip ID mismatch! Expected ${TRIP_ID}, got ${booking.trip_id}`);
    if (booking.pax !== 2) throw new Error(`Pax mismatch! Expected 2, got ${booking.pax}`);
    
    console.log('E2E Test PASSED!');
    
    fs.writeFileSync('.sisyphus/evidence/task-8-e2e-happy.txt', `
    E2E Test Passed.
    Package: ${PACKAGE_ID}
    User: ${USER_EMAIL}
    Customer: ${CUSTOMER_ID}
    Booking: ${booking.id}
    Trip: ${TRIP_ID}
    Time: ${TARGET_TIME}
    Total: ${booking.total_amount}
    `);
    
  } catch (error) {
    console.error('Test Failed:', error);
    await page.screenshot({ path: 'test-failure.png' });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
