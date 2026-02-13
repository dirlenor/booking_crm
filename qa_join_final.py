from playwright.sync_api import sync_playwright
import json

def main():
    results = {"pass": [], "fail": [], "data": {}}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        
        try:
            print("\n=== NAVIGATE TO DESTINATION ===")
            page.goto('http://localhost:3000/destinations')
            page.wait_for_load_state('networkidle')
            
            page.locator('a[href*="/destinations/"]:not([href="/destinations"])').first.click()
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)
            
            print("\n=== SELECT DATE ===")
            date_btn = page.locator('button:has-text("Choose Date")').first
            if date_btn.is_visible():
                date_btn.click()
                page.wait_for_timeout(500)
            
            page.locator('button.border-primary\\/30').first.click()
            page.wait_for_timeout(1000)
            
            print("\n=== SELECT JOIN OPTION ===")
            page.locator('input[name="package-option"]').first.check()
            page.wait_for_timeout(1000)
            
            print("\n=== INCREMENT PAX COUNTS ===")
            
            adult_container = page.locator('div:has(> div > label:has-text("Adult"))').first
            adult_plus = adult_container.locator('button:has-text("+")').last
            adult_value = adult_container.locator('div.w-10').first
            
            print(f"Adult before: {adult_value.inner_text()}")
            adult_plus.click()
            page.wait_for_timeout(500)
            print(f"Adult after +: {adult_value.inner_text()}")
            
            child_container = page.locator('div:has(> div > label:has-text("Child"))').first
            child_plus = child_container.locator('button:has-text("+")').last
            child_value = child_container.locator('div.w-10').first
            
            print(f"Child before: {child_value.inner_text()}")
            child_plus.click()
            page.wait_for_timeout(500)
            print(f"Child after +: {child_value.inner_text()}")
            
            infant_container = page.locator('div:has(> div > label:has-text("Infant"))').first
            infant_plus = infant_container.locator('button:has-text("+")').last
            infant_value = infant_container.locator('div.w-10').first
            
            print(f"Infant before: {infant_value.inner_text()}")
            infant_plus.click()
            page.wait_for_timeout(500)
            print(f"Infant after +: {infant_value.inner_text()}")
            
            page.screenshot(path='/tmp/qa_final_01_pax_set.png', full_page=True)
            
            final_adult = int(adult_value.inner_text())
            final_child = int(child_value.inner_text())
            final_infant = int(infant_value.inner_text())
            
            results["data"]["pax_counts"] = {
                "adult": final_adult,
                "child": final_child,
                "infant": final_infant,
                "total": final_adult + final_child + final_infant
            }
            
            print(f"\nFinal counts: Adult={final_adult}, Child={final_child}, Infant={final_infant}")
            
            if final_adult >= 1 and final_child >= 1 and final_infant >= 1:
                results["pass"].append("(b.1) Adult/Child/Infant selectors work")
            else:
                results["fail"].append(f"(b.1) Pax not set correctly: A={final_adult}, C={final_child}, I={final_infant}")
            
            print("\n=== CAPTURE PRICE BREAKDOWN ===")
            
            price_section = page.locator('div.bg-gray-50.rounded-xl').first
            price_text = price_section.inner_text()
            print(price_text)
            
            results["data"]["price_breakdown_before_check"] = price_text
            
            has_child_price = 'child' in price_text.lower() and final_child > 0
            if has_child_price:
                results["pass"].append("(b.2) Child price shown in breakdown")
            elif final_child == 0:
                results["fail"].append("(b.2) Child count is 0, cannot verify")
            else:
                results["fail"].append("(b.2) Child price not shown despite child > 0")
            
            print("\n=== SELECT TIME SLOT ===")
            time_btns = page.locator('button').all()
            for btn in time_btns:
                try:
                    text = btn.inner_text()
                    if ':' in text and len(text) < 10:
                        print(f"Clicking time: {text}")
                        btn.click()
                        page.wait_for_timeout(500)
                        break
                except:
                    pass
            
            print("\n=== CHECK AVAILABILITY ===")
            page.locator('button:has-text("Check")').first.click()
            page.wait_for_timeout(2000)
            page.screenshot(path='/tmp/qa_final_02_after_check.png', full_page=True)
            
            success_msg = page.locator('text=/available|great news/i').first
            error_msg = page.locator('text=/minimum|maximum|error/i').first
            
            if success_msg.is_visible():
                msg = success_msg.inner_text()
                print(f"✓ Success: {msg}")
                results["pass"].append("(c) Check availability succeeded")
                results["data"]["availability_message"] = msg
            elif error_msg.is_visible():
                msg = error_msg.inner_text()
                print(f"✗ Error: {msg}")
                results["fail"].append(f"(c) Check failed: {msg}")
                results["data"]["error_message"] = msg
            
            print("\n=== ADD TO CART ===")
            
            all_btns = page.locator('button').all()
            print(f"\nSearching {len(all_btns)} buttons for Add to Cart...")
            
            add_btn_found = False
            for btn in all_btns:
                try:
                    if btn.is_visible():
                        text = btn.inner_text().strip()
                        if 'add' in text.lower() and len(text) < 30:
                            print(f"Found: '{text}'")
                            btn.click()
                            page.wait_for_timeout(2000)
                            add_btn_found = True
                            break
                except:
                    pass
            
            if not add_btn_found:
                print("⚠ No Add button found, checking for drawer/modal...")
                page.screenshot(path='/tmp/qa_final_03_no_add_btn.png', full_page=True)
            
            page.screenshot(path='/tmp/qa_final_04_after_add_attempt.png', full_page=True)
            
            cart_msg = page.locator('text=/added.*cart/i').first
            if cart_msg.is_visible():
                print(f"✓ {cart_msg.inner_text()}")
                results["pass"].append("(d) Add to cart succeeded")
            
            print("\n=== NAVIGATE TO CART ===")
            page.goto('http://localhost:3000/cart')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1500)
            page.screenshot(path='/tmp/qa_final_05_cart.png', full_page=True)
            
            empty = page.locator('text=/cart is empty/i').first
            if empty.is_visible():
                print("✗ Cart is empty")
                results["fail"].append("(d) Cart empty - item not added")
            else:
                print("✓ Cart has items")
                
                cart_text = page.locator('body').inner_text()
                results["data"]["cart_content"] = cart_text[:2000]
                
                print("\nSearching for totals and pax info...")
                
                total_elements = page.locator('text=/total.*\\d/i').all()
                for el in total_elements:
                    if el.is_visible():
                        print(f"  Total: {el.inner_text()}")
                
                pax_elements = page.locator('text=/adult|child|infant|traveler/i').all()
                for el in pax_elements[:10]:
                    try:
                        if el.is_visible():
                            text = el.inner_text().strip()
                            if len(text) < 100:
                                print(f"  Pax: {text}")
                    except:
                        pass
                
                results["pass"].append("(d.1) Cart displays items")
                
                print("\n=== TEST +/- BUTTONS ===")
                
                minus_btns = page.locator('button:has-text("-")').all()
                plus_btns = page.locator('button:has-text("+")').all()
                
                print(f"Found {len(minus_btns)} minus, {len(plus_btns)} plus buttons")
                
                if len(minus_btns) > 0:
                    total_before = page.locator('text=/total/i').last.inner_text() if page.locator('text=/total/i').count() > 0 else "N/A"
                    print(f"Total before: {total_before}")
                    
                    minus_btns[0].click()
                    page.wait_for_timeout(1000)
                    page.screenshot(path='/tmp/qa_final_06_after_minus.png', full_page=True)
                    
                    total_after = page.locator('text=/total/i').last.inner_text() if page.locator('text=/total/i').count() > 0 else "N/A"
                    print(f"Total after: {total_after}")
                    
                    results["data"]["total_before_minus"] = total_before
                    results["data"]["total_after_minus"] = total_after
                    
                    if total_before != total_after:
                        results["pass"].append("(e.2) Totals update after -")
                    else:
                        results["fail"].append("(e.2) Totals did not update")
                    
                    print("\nTesting min enforcement...")
                    for i in range(10):
                        try:
                            if minus_btns[0].is_disabled():
                                print(f"✓ Disabled after {i} clicks")
                                results["pass"].append("(e.1) Min pax enforced (button disabled)")
                                break
                            minus_btns[0].click()
                            page.wait_for_timeout(300)
                        except:
                            print(f"✓ Button removed after {i} clicks")
                            results["pass"].append("(e.1) Min pax enforced (item removed)")
                            break
                    
                    page.screenshot(path='/tmp/qa_final_07_min_test.png', full_page=True)
            
            page.screenshot(path='/tmp/qa_final_08_final.png', full_page=True)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
            results["fail"].append(f"Exception: {str(e)}")
            page.screenshot(path='/tmp/qa_final_error.png', full_page=True)
        
        finally:
            browser.close()
    
    print("\n" + "="*80)
    print("FINAL RESULTS")
    print("="*80)
    print(f"\n✅ PASSED: {len(results['pass'])}")
    for p in results["pass"]:
        print(f"  - {p}")
    
    print(f"\n❌ FAILED: {len(results['fail'])}")
    for f in results["fail"]:
        print(f"  - {f}")
    
    print(f"\n📊 DATA:")
    print(json.dumps(results["data"], indent=2))
    
    with open('/tmp/qa_final_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✅ Results: /tmp/qa_final_results.json")

if __name__ == "__main__":
    main()
