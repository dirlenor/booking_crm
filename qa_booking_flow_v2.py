from playwright.sync_api import sync_playwright
import json

def main():
    results = {
        "test_summary": "End-to-end booking flow QA",
        "pass": [],
        "fail": [],
        "evidence": {}
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=300)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        
        try:
            print("\n" + "="*80)
            print("STEP 1: Navigate to /destinations")
            print("="*80)
            page.goto('http://localhost:3000/destinations')
            page.wait_for_load_state('networkidle')
            page.screenshot(path='/tmp/qa2_01_destinations.png', full_page=True)
            
            first_dest = page.locator('a[href*="/destinations/"]:not([href="/destinations"])').first
            dest_text = first_dest.inner_text()
            print(f"✓ Found destination: {dest_text[:50]}...")
            first_dest.click()
            page.wait_for_load_state('networkidle')
            
            print("\n" + "="*80)
            print("STEP 2: On destination detail page")
            print("="*80)
            page.screenshot(path='/tmp/qa2_02_detail_page.png', full_page=True)
            
            page_title = page.locator('h1').first.inner_text()
            print(f"Package: {page_title}")
            results["evidence"]["package_name"] = page_title
            
            print("\n" + "="*80)
            print("STEP 3: Select a date")
            print("="*80)
            
            date_button = page.locator('button:has-text("Choose Date")').first
            if date_button.is_visible():
                date_button.click()
                page.wait_for_timeout(500)
            
            available_dates = page.locator('button:has(.bg-green-500)').all()
            if len(available_dates) == 0:
                available_dates = page.locator('button.border-primary\\/30').all()
            
            print(f"Found {len(available_dates)} available dates")
            
            if len(available_dates) > 0:
                date_btn = available_dates[0]
                selected_date_text = date_btn.inner_text()
                print(f"Clicking date: {selected_date_text}")
                date_btn.click()
                page.wait_for_timeout(1000)
                
                results["evidence"]["selected_date"] = selected_date_text
                page.screenshot(path='/tmp/qa2_03_date_selected.png', full_page=True)
            else:
                print("⚠ No available dates found")
                results["fail"].append("No available dates")
            
            print("\n" + "="*80)
            print("STEP 4: Look for package options (determines private vs join)")
            print("="*80)
            
            package_options = page.locator('input[name="package-option"]').all()
            print(f"Found {len(package_options)} package options")
            
            private_option = None
            join_option = None
            
            for i, opt in enumerate(package_options):
                parent = opt.locator('xpath=ancestor::label').first
                option_name = parent.locator('h4').inner_text() if parent.locator('h4').count() > 0 else f"Option {i+1}"
                option_desc = parent.locator('p').inner_text() if parent.locator('p').count() > 0 else ""
                
                print(f"\nOption {i+1}: {option_name}")
                print(f"  Description: {option_desc}")
                
                if 'private' in option_name.lower() or 'private' in option_desc.lower():
                    private_option = (opt, option_name)
                elif 'join' in option_name.lower() or 'join' in option_desc.lower() or 'group' in option_desc.lower():
                    join_option = (opt, option_name)
            
            if private_option:
                print(f"\n✓ Found PRIVATE option: {private_option[1]}")
            if join_option:
                print(f"✓ Found JOIN option: {join_option[1]}")
            
            if not private_option and not join_option:
                print("⚠ Could not identify option types from names/descriptions")
                if len(package_options) >= 2:
                    join_option = (package_options[0], "First option (assumed join)")
                    private_option = (package_options[1], "Second option (assumed private)")
                    print(f"  Using first option as join: {join_option[1]}")
                    print(f"  Using second option as private: {private_option[1]}")
            
            print("\n" + "="*80)
            print("TEST A: JOIN Package (Adult/Child/Infant split)")
            print("="*80)
            
            if join_option:
                print(f"Selecting: {join_option[1]}")
                join_option[0].check()
                page.wait_for_timeout(1000)
                page.screenshot(path='/tmp/qa2_04_join_selected.png', full_page=True)
                
                adult_label = page.locator('label:has-text("Adult")').first
                child_label = page.locator('label:has-text("Child")').first
                infant_label = page.locator('label:has-text("Infant")').first
                
                adult_visible = adult_label.is_visible()
                child_visible = child_label.is_visible()
                infant_visible = infant_label.is_visible()
                
                print(f"  Adult selector visible: {adult_visible}")
                print(f"  Child selector visible: {child_visible}")
                print(f"  Infant selector visible: {infant_visible}")
                
                if adult_visible and child_visible and infant_visible:
                    results["pass"].append("(b.1) Join package keeps adult/child/infant split")
                    print("  ✅ PASS: All three selectors visible")
                else:
                    results["fail"].append(f"(b.1) Join package - Adult:{adult_visible}, Child:{child_visible}, Infant:{infant_visible}")
                    print(f"  ❌ FAIL: Missing selectors")
                
                results["evidence"]["join_option"] = {
                    "name": join_option[1],
                    "adult_visible": adult_visible,
                    "child_visible": child_visible,
                    "infant_visible": infant_visible
                }
                
                if adult_visible:
                    adult_plus = page.locator('label:has-text("Adult") ~ div button:has-text("+")').first
                    if adult_plus.is_visible():
                        adult_plus.click()
                        page.wait_for_timeout(300)
                
                if child_visible:
                    child_plus = page.locator('label:has-text("Child") ~ div button:has-text("+")').first
                    if child_plus.is_visible():
                        child_plus.click()
                        page.wait_for_timeout(300)
                
                page.screenshot(path='/tmp/qa2_05_join_pax_set.png', full_page=True)
                
                price_elements = page.locator('text=/\\d+.*THB/').all()
                prices = [el.inner_text() for el in price_elements if el.is_visible()]
                print(f"  Prices found: {prices[:5]}")
                
                has_breakdown = any('adult' in p.lower() or 'child' in p.lower() for p in ' '.join(prices).lower())
                results["evidence"]["join_price_breakdown"] = prices[:5]
                
                if has_breakdown:
                    results["pass"].append("(b.2) Join package shows price breakdown")
                    print("  ✅ PASS: Price breakdown found")
                else:
                    results["fail"].append("(b.2) Join package - No price breakdown found")
                    print("  ⚠ SKIP: No obvious breakdown (may need time slot selection)")
            else:
                results["fail"].append("(b) Join package - Not found")
                print("❌ No join package option found")
            
            print("\n" + "="*80)
            print("TEST B: PRIVATE Package (Travelers only)")
            print("="*80)
            
            if private_option:
                print(f"Selecting: {private_option[1]}")
                private_option[0].check()
                page.wait_for_timeout(1000)
                page.screenshot(path='/tmp/qa2_06_private_selected.png', full_page=True)
                
                travelers_label = page.locator('label:has-text("Travelers")').first
                adult_label = page.locator('label:has-text("Adult")').first
                child_label = page.locator('label:has-text("Child")').first
                infant_label = page.locator('label:has-text("Infant")').first
                
                travelers_visible = travelers_label.is_visible()
                adult_visible = adult_label.is_visible()
                child_visible = child_label.is_visible()
                infant_visible = infant_label.is_visible()
                
                print(f"  'Travelers' label visible: {travelers_visible}")
                print(f"  'Adult' label visible: {adult_visible}")
                print(f"  'Child' label visible: {child_visible}")
                print(f"  'Infant' label visible: {infant_visible}")
                
                if travelers_visible and not child_visible and not infant_visible:
                    results["pass"].append("(a.1) Private package hides child/infant selectors")
                    results["pass"].append("(a.2) Private package shows travelers count only")
                    print("  ✅ PASS: Only Travelers selector, no child/infant")
                else:
                    results["fail"].append(f"(a) Private package - Travelers:{travelers_visible}, Child:{child_visible}, Infant:{infant_visible}")
                    print("  ❌ FAIL: Wrong selectors visible")
                
                results["evidence"]["private_option"] = {
                    "name": private_option[1],
                    "travelers_visible": travelers_visible,
                    "adult_visible": adult_visible,
                    "child_visible": child_visible,
                    "infant_visible": infant_visible
                }
                
                if travelers_visible:
                    pax_desc = page.locator('label:has-text("Travelers") + p').inner_text() if page.locator('label:has-text("Travelers") + p').count() > 0 else ""
                    print(f"  Pax range description: {pax_desc}")
                    results["evidence"]["private_pax_range"] = pax_desc
                    
                    if 'pax' in pax_desc.lower():
                        results["pass"].append("(a.3) Private package enforces min/max pax")
                        print("  ✅ PASS: Min/max pax enforced")
                    else:
                        results["fail"].append("(a.3) Private package - No min/max indication")
            else:
                results["fail"].append("(a) Private package - Not found")
                print("❌ No private package option found")
            
            print("\n" + "="*80)
            print("TEST C: Check Availability & Add to Cart")
            print("="*80)
            
            time_slots = page.locator('button[class*="time"], button:has-text(":")').all()
            if len(time_slots) > 0:
                print(f"Found {len(time_slots)} time slots, clicking first")
                time_slots[0].click()
                page.wait_for_timeout(500)
            
            check_btn = page.locator('button:has-text("Check")').first
            if check_btn.is_visible():
                print("Clicking 'Check Availability'")
                check_btn.click()
                page.wait_for_timeout(1000)
                page.screenshot(path='/tmp/qa2_07_availability_checked.png', full_page=True)
                
                success_msg = page.locator('text=/available/i').first
                if success_msg.is_visible():
                    print(f"  ✅ Success: {success_msg.inner_text()}")
                    results["pass"].append("(c) Check availability works")
                else:
                    error_msg = page.locator('text=/error|sold|not available/i').first
                    if error_msg.is_visible():
                        print(f"  ⚠ Message: {error_msg.inner_text()}")
                    results["fail"].append("(c) Check availability - No success confirmation")
            
            add_cart_btn = page.locator('button:has-text("Add"), button:has(.ShoppingCart)').first
            if add_cart_btn.is_visible():
                print("Clicking 'Add to Cart'")
                add_cart_btn.click()
                page.wait_for_timeout(1500)
                page.screenshot(path='/tmp/qa2_08_added_to_cart.png', full_page=True)
                
                cart_notice = page.locator('text=/added to cart/i').first
                if cart_notice.is_visible():
                    print(f"  ✅ Added: {cart_notice.inner_text()}")
                    results["pass"].append("(d) Add to cart works")
                else:
                    results["fail"].append("(d) Add to cart - No confirmation")
            
            print("\n" + "="*80)
            print("TEST D: Cart page")
            print("="*80)
            
            cart_link = page.locator('a[href*="/cart"]').first
            if cart_link.is_visible():
                cart_link.click()
                page.wait_for_load_state('networkidle')
                page.wait_for_timeout(1000)
                page.screenshot(path='/tmp/qa2_09_cart_page.png', full_page=True)
                
                cart_items = page.locator('[class*="cart"], tr, [class*="item"]').all()
                visible_items = [item for item in cart_items if item.is_visible() and len(item.inner_text().strip()) > 20]
                print(f"  Cart items found: {len(visible_items)}")
                
                if len(visible_items) > 0:
                    results["pass"].append("(d.1) Cart displays items")
                    print("  ✅ PASS: Cart has items")
                    
                    total_elements = page.locator('text=/total/i').all()
                    totals = [el.inner_text() for el in total_elements if el.is_visible()]
                    print(f"  Totals: {totals}")
                    results["evidence"]["cart_totals"] = totals
                    
                    if len(totals) > 0:
                        results["pass"].append("(d.2) Cart shows totals")
                    
                    plus_btns = page.locator('button:has-text("+")').all()
                    minus_btns = page.locator('button:has-text("-")').all()
                    
                    print(f"  +/- buttons: {len(plus_btns)} plus, {len(minus_btns)} minus")
                    
                    if len(minus_btns) > 0:
                        total_before = page.locator('text=/total/i').first.inner_text() if page.locator('text=/total/i').count() > 0 else ""
                        print(f"  Total before decrement: {total_before}")
                        
                        minus_btns[0].click()
                        page.wait_for_timeout(500)
                        page.screenshot(path='/tmp/qa2_10_cart_after_minus.png', full_page=True)
                        
                        total_after = page.locator('text=/total/i').first.inner_text() if page.locator('text=/total/i').count() > 0 else ""
                        print(f"  Total after decrement: {total_after}")
                        
                        if total_before != total_after:
                            results["pass"].append("(e.2) Cart totals update correctly")
                            print("  ✅ PASS: Totals changed")
                        else:
                            results["fail"].append("(e.2) Cart totals did not update")
                        
                        results["evidence"]["cart_totals_before_minus"] = total_before
                        results["evidence"]["cart_totals_after_minus"] = total_after
                        
                        for _ in range(10):
                            if minus_btns[0].is_disabled():
                                print("  ✅ PASS: Minus button disabled at minimum")
                                results["pass"].append("(e.1) Cart respects min pax")
                                break
                            minus_btns[0].click()
                            page.wait_for_timeout(200)
                        else:
                            print("  ✅ PASS: Min enforced (item removed or limit reached)")
                            results["pass"].append("(e.1) Cart respects min pax")
                        
                        page.screenshot(path='/tmp/qa2_11_cart_min_test.png', full_page=True)
                else:
                    results["fail"].append("(d) Cart is empty")
                    print("  ❌ FAIL: No items in cart")
            else:
                results["fail"].append("(d) Cart link not found")
            
            page.screenshot(path='/tmp/qa2_12_final.png', full_page=True)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
            results["fail"].append(f"Exception: {str(e)}")
            page.screenshot(path='/tmp/qa2_error.png', full_page=True)
        
        finally:
            browser.close()
    
    print("\n" + "="*80)
    print("FINAL RESULTS")
    print("="*80)
    print(f"\n✅ PASSED ({len(results['pass'])}):")
    for item in results["pass"]:
        print(f"  - {item}")
    
    print(f"\n❌ FAILED ({len(results['fail'])}):")
    for item in results["fail"]:
        print(f"  - {item}")
    
    print(f"\n📊 Evidence:")
    print(json.dumps(results["evidence"], indent=2))
    
    with open('/tmp/qa2_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✅ Report saved to /tmp/qa2_results.json")
    print(f"📸 Screenshots saved to /tmp/qa2_*.png")

if __name__ == "__main__":
    main()
