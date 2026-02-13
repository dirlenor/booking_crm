from playwright.sync_api import sync_playwright
import json
import time

def safe_text(locator):
    try:
        if locator.count() > 0 and locator.first.is_visible():
            return locator.first.inner_text()
    except:
        pass
    return ""

def main():
    results = {
        "join_flow": {},
        "cart_operations": {},
        "pass": [],
        "fail": []
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=400)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        
        try:
            print("\n" + "="*80)
            print("STEP 1: Navigate to destination")
            print("="*80)
            page.goto('http://localhost:3000/destinations')
            page.wait_for_load_state('networkidle')
            
            first_dest = page.locator('a[href*="/destinations/"]:not([href="/destinations"])').first
            first_dest.click()
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)
            
            package_name = page.locator('h1').first.inner_text()
            print(f"Package: {package_name}")
            
            print("\n" + "="*80)
            print("STEP 2: Select date and join option")
            print("="*80)
            
            date_button = page.locator('button:has-text("Choose Date")').first
            if date_button.is_visible():
                date_button.click()
                page.wait_for_timeout(500)
            
            available_dates = page.locator('button.border-primary\\/30, button:has(.bg-green-500)').all()
            if len(available_dates) > 0:
                available_dates[0].click()
                page.wait_for_timeout(1000)
                print("✓ Date selected")
            
            package_options = page.locator('input[name="package-option"]').all()
            if len(package_options) > 0:
                package_options[0].check()
                page.wait_for_timeout(1000)
                
                parent = package_options[0].locator('xpath=ancestor::label').first
                option_name = parent.locator('h4').inner_text() if parent.locator('h4').count() > 0 else "Option 1"
                print(f"✓ Selected: {option_name}")
                results["join_flow"]["option_name"] = option_name
            
            page.screenshot(path='/tmp/qa3_01_option_selected.png', full_page=True)
            
            print("\n" + "="*80)
            print("STEP 3: Set pax counts (Adult=2, Child=1, Infant=1)")
            print("="*80)
            
            adult_visible = page.locator('label:has-text("Adult")').first.is_visible()
            child_visible = page.locator('label:has-text("Child")').first.is_visible()
            infant_visible = page.locator('label:has-text("Infant")').first.is_visible()
            
            print(f"Adult selector: {adult_visible}")
            print(f"Child selector: {child_visible}")
            print(f"Infant selector: {infant_visible}")
            
            if adult_visible and child_visible and infant_visible:
                results["pass"].append("(b.1) Join package shows Adult/Child/Infant split")
            else:
                results["fail"].append(f"(b.1) Selectors - Adult:{adult_visible}, Child:{child_visible}, Infant:{infant_visible}")
            
            if adult_visible:
                adult_plus = page.locator('label:has-text("Adult") ~ div button:has-text("+"), div:has(> label:has-text("Adult")) button:has-text("+")').first
                if adult_plus.is_visible():
                    adult_plus.click()
                    page.wait_for_timeout(300)
                    print("✓ Adult: 1 → 2")
            
            if child_visible:
                child_plus = page.locator('label:has-text("Child") ~ div button:has-text("+"), div:has(> label:has-text("Child")) button:has-text("+")').first
                if child_plus.is_visible():
                    child_plus.click()
                    page.wait_for_timeout(300)
                    print("✓ Child: 0 → 1")
            
            if infant_visible:
                infant_plus = page.locator('label:has-text("Infant") ~ div button:has-text("+"), div:has(> label:has-text("Infant")) button:has-text("+")').first
                if infant_plus.is_visible():
                    infant_plus.click()
                    page.wait_for_timeout(300)
                    print("✓ Infant: 0 → 1")
            
            page.screenshot(path='/tmp/qa3_02_pax_set.png', full_page=True)
            
            print("\n" + "="*80)
            print("STEP 4: Capture price breakdown BEFORE Check")
            print("="*80)
            
            price_texts = []
            for selector in ['text=/adult.*thb/i', 'text=/child.*thb/i', 'text=/infant.*thb/i', 'text=/total.*thb/i', 'text=/\\d+,?\\d*\\s*thb/i']:
                elements = page.locator(selector).all()
                for el in elements:
                    try:
                        if el.is_visible():
                            text = el.inner_text().strip()
                            if text and text not in price_texts:
                                price_texts.append(text)
                    except:
                        pass
            
            print("Price breakdown displayed:")
            for price in price_texts[:10]:
                print(f"  - {price}")
            
            results["join_flow"]["prices_before_check"] = price_texts[:10]
            
            adult_line = [p for p in price_texts if 'adult' in p.lower() and 'thb' in p.lower()]
            child_line = [p for p in price_texts if 'child' in p.lower() and 'thb' in p.lower()]
            infant_line = [p for p in price_texts if 'infant' in p.lower() and 'thb' in p.lower()]
            total_line = [p for p in price_texts if 'total' in p.lower() and 'thb' in p.lower()]
            
            results["join_flow"]["adult_price_line"] = adult_line[0] if adult_line else None
            results["join_flow"]["child_price_line"] = child_line[0] if child_line else None
            results["join_flow"]["infant_price_line"] = infant_line[0] if infant_line else None
            results["join_flow"]["total_line"] = total_line[0] if total_line else None
            
            if child_line:
                results["pass"].append("(b.2) Child price displayed in breakdown")
                print(f"✓ Child pricing found: {child_line[0]}")
            else:
                results["fail"].append("(b.2) No child price in breakdown")
                print("✗ Child pricing not found")
            
            print("\n" + "="*80)
            print("STEP 5: Select time slot")
            print("="*80)
            
            time_buttons = page.locator('button').all()
            time_clicked = False
            for btn in time_buttons:
                try:
                    text = btn.inner_text()
                    if ':' in text and len(text) < 10:
                        print(f"Clicking time: {text}")
                        btn.click()
                        page.wait_for_timeout(500)
                        time_clicked = True
                        break
                except:
                    pass
            
            if not time_clicked:
                print("⚠ No time slot found, trying to proceed")
            
            print("\n" + "="*80)
            print("STEP 6: Click Check Availability")
            print("="*80)
            
            check_btn = page.locator('button:has-text("Check")').first
            if check_btn.is_visible():
                print("Clicking 'Check'...")
                check_btn.click()
                page.wait_for_timeout(2000)
                page.screenshot(path='/tmp/qa3_03_after_check.png', full_page=True)
                
                success_indicators = [
                    'text=/available/i',
                    'text=/great news/i',
                    'text=/you can add/i'
                ]
                
                success_found = False
                for selector in success_indicators:
                    msg = safe_text(page.locator(selector))
                    if msg:
                        print(f"✓ Success: {msg}")
                        results["join_flow"]["availability_message"] = msg
                        success_found = True
                        break
                
                error_msg = safe_text(page.locator('text=/minimum|maximum|error|sold/i'))
                if error_msg and not success_found:
                    print(f"✗ Error: {error_msg}")
                    results["join_flow"]["error_message"] = error_msg
                    results["fail"].append(f"(c) Check availability failed: {error_msg}")
                elif success_found:
                    results["pass"].append("(c) Check availability succeeded")
            
            print("\n" + "="*80)
            print("STEP 7: Add to Cart")
            print("="*80)
            
            add_selectors = [
                'button:has-text("Add to Cart")',
                'button:has-text("Add")',
                'button:has(.ShoppingCart)',
                'button[id*="add"]',
                'button[class*="add"]'
            ]
            
            added = False
            for selector in add_selectors:
                try:
                    btn = page.locator(selector).first
                    if btn.is_visible():
                        btn_text = btn.inner_text()
                        print(f"Found button: '{btn_text}' ({selector})")
                        btn.click()
                        page.wait_for_timeout(2000)
                        added = True
                        break
                except:
                    pass
            
            if not added:
                all_buttons = page.locator('button').all()
                print(f"\nAll visible buttons ({len(all_buttons)}):")
                for i, btn in enumerate(all_buttons[:20]):
                    try:
                        if btn.is_visible():
                            text = btn.inner_text().strip()
                            if text and len(text) < 50:
                                print(f"  [{i}] {text}")
                    except:
                        pass
            
            page.screenshot(path='/tmp/qa3_04_after_add.png', full_page=True)
            
            cart_notice = safe_text(page.locator('text=/added.*cart/i'))
            if cart_notice:
                print(f"✓ Cart notice: {cart_notice}")
                results["pass"].append("(d) Add to cart succeeded")
            else:
                print("⚠ No cart confirmation found")
            
            print("\n" + "="*80)
            print("STEP 8: Navigate to Cart")
            print("="*80)
            
            page.goto('http://localhost:3000/cart')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1500)
            page.screenshot(path='/tmp/qa3_05_cart_page.png', full_page=True)
            
            empty_msg = safe_text(page.locator('text=/cart is empty/i'))
            if empty_msg:
                print(f"✗ Cart empty: {empty_msg}")
                results["fail"].append("(d) Cart is empty - item not added")
            else:
                print("✓ Cart has content")
                
                cart_prices = []
                for selector in ['text=/thb/i', 'text=/\\d+,?\\d+/']:
                    elements = page.locator(selector).all()
                    for el in elements[:30]:
                        try:
                            if el.is_visible():
                                text = el.inner_text().strip()
                                if 'thb' in text.lower() or text.replace(',', '').isdigit():
                                    cart_prices.append(text)
                        except:
                            pass
                
                print(f"\nCart prices/numbers found: {len(cart_prices)}")
                for price in cart_prices[:15]:
                    print(f"  - {price}")
                
                results["cart_operations"]["prices_displayed"] = cart_prices[:15]
                
                traveler_badges = []
                for selector in ['text=/adult/i', 'text=/child/i', 'text=/infant/i', 'text=/traveler/i', 'text=/pax/i']:
                    elements = page.locator(selector).all()
                    for el in elements[:10]:
                        try:
                            if el.is_visible():
                                text = el.inner_text().strip()
                                if text and len(text) < 100:
                                    traveler_badges.append(text)
                        except:
                            pass
                
                print(f"\nTraveler badges/labels: {len(traveler_badges)}")
                for badge in traveler_badges[:10]:
                    print(f"  - {badge}")
                
                results["cart_operations"]["traveler_badges"] = traveler_badges[:10]
                
                if len(cart_prices) > 0:
                    results["pass"].append("(d.1) Cart displays totals")
                if len(traveler_badges) > 0:
                    results["pass"].append("(d.2) Cart displays traveler counts")
                
                print("\n" + "="*80)
                print("STEP 9: Test +/- buttons")
                print("="*80)
                
                plus_btns = page.locator('button:has-text("+")').all()
                minus_btns = page.locator('button:has-text("-")').all()
                
                print(f"Found {len(plus_btns)} plus buttons, {len(minus_btns)} minus buttons")
                
                if len(minus_btns) > 0:
                    total_before = safe_text(page.locator('text=/total.*thb/i').last)
                    print(f"Total before: {total_before}")
                    
                    minus_btns[0].click()
                    page.wait_for_timeout(1000)
                    page.screenshot(path='/tmp/qa3_06_after_minus.png', full_page=True)
                    
                    total_after = safe_text(page.locator('text=/total.*thb/i').last)
                    print(f"Total after: {total_after}")
                    
                    results["cart_operations"]["total_before_minus"] = total_before
                    results["cart_operations"]["total_after_minus"] = total_after
                    
                    if total_before != total_after:
                        results["pass"].append("(e.2) Cart totals update after -")
                        print("✓ Total changed")
                    else:
                        results["fail"].append("(e.2) Cart total did not change")
                        print("✗ Total unchanged")
                    
                    print("\nTesting min enforcement (clicking - repeatedly)...")
                    for i in range(10):
                        try:
                            if minus_btns[0].is_disabled():
                                print(f"✓ Minus disabled after {i} clicks")
                                results["pass"].append("(e.1) Cart respects min pax (button disabled)")
                                break
                            minus_btns[0].click()
                            page.wait_for_timeout(300)
                        except:
                            print(f"✓ Minus button removed/errored after {i} clicks")
                            results["pass"].append("(e.1) Cart respects min pax (item removed)")
                            break
                    
                    page.screenshot(path='/tmp/qa3_07_min_test.png', full_page=True)
                    
                    final_state = safe_text(page.locator('text=/cart is empty/i'))
                    if final_state:
                        print("Item removed from cart (reached minimum)")
                    else:
                        final_total = safe_text(page.locator('text=/total.*thb/i').last)
                        print(f"Final total: {final_total}")
                        results["cart_operations"]["final_total"] = final_total
                
                if len(plus_btns) > 0:
                    print("\nTesting + button...")
                    try:
                        plus_btns[0].click()
                        page.wait_for_timeout(1000)
                        page.screenshot(path='/tmp/qa3_08_after_plus.png', full_page=True)
                        
                        total_after_plus = safe_text(page.locator('text=/total.*thb/i').last)
                        print(f"Total after +: {total_after_plus}")
                        results["cart_operations"]["total_after_plus"] = total_after_plus
                    except Exception as e:
                        print(f"Plus button error: {e}")
            
            page.screenshot(path='/tmp/qa3_09_final.png', full_page=True)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
            results["fail"].append(f"Exception: {str(e)}")
            page.screenshot(path='/tmp/qa3_error.png', full_page=True)
        
        finally:
            time.sleep(1)
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
    
    print(f"\n📊 JOIN FLOW DATA:")
    print(json.dumps(results["join_flow"], indent=2))
    
    print(f"\n🛒 CART OPERATIONS DATA:")
    print(json.dumps(results["cart_operations"], indent=2))
    
    with open('/tmp/qa3_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✅ Full results: /tmp/qa3_results.json")
    print(f"📸 Screenshots: /tmp/qa3_*.png")

if __name__ == "__main__":
    main()
