import asyncio
from playwright.async_api import async_playwright

async def capture_all_modules():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        )
        context = await browser.new_context(viewport={'width': 1440, 'height': 900})
        page = await context.new_page()

        print("Navigating to login...")
        await page.goto("http://localhost:3002/login", wait_until="networkidle")

        # Fill login form
        await page.fill('input[type="email"]', 'coach@rjbusinesssolutions.org')
        await page.fill('input[type="password"]', 'gridiron2024')
        await page.click('button[type="submit"]')
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(2)

        # Map labels from sidebar exactly:
        # Command Center, PlaybookIQ, Formation Lab, ScoutIQ, Coach AI, GamePlanIQ, CallSheetIQ, FilmIQ, RedZoneIQ, InstallIQ
        modules = [
            ("Command Center", "01-command-center.png"),
            ("PlaybookIQ", "02-playbook.png"),
            ("Formation Lab", "03-formation-lab.png"),
            ("ScoutIQ", "04-scout.png"),
            ("Coach AI", "05-coach-ai.png"),
            ("GamePlanIQ", "06-gameplan.png"),
            ("CallSheetIQ", "07-callsheet.png"),
            ("FilmIQ", "08-film.png"),
            ("RedZoneIQ", "09-redzone.png"),
            ("InstallIQ", "10-install.png"),
            ("TendencyLab", "11-tendency-lab.png"),
            ("DepthChartIQ", "12-depth-chart.png"),
        ]

        for label, filename in modules:
            try:
                print(f"Selecting module: {label}...")
                btn = page.locator(f"button:has-text('{label}')").first
                if await btn.count() > 0:
                    await btn.click()
                    await asyncio.sleep(2)
                    await page.screenshot(path=f"public/screenshots/{filename}")
                    print(f"Captured {filename}")
                else:
                    print(f"Could not find button for '{label}'")
            except Exception as e:
                print(f"Error for {label}: {e}")

        await browser.close()
        print("Done!")

if __name__ == "__main__":
    asyncio.run(capture_all_modules())
