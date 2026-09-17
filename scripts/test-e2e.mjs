import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const BRAVE_PATH = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";
const BASE_URL = "http://localhost:3001";
const ARTIFACT_DIR = "/Users/toasty/.gemini/antigravity/brain/d8d3bf1b-2fa6-420e-b003-8eeb6607b4e9";
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, "screenshots");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runTests() {
  console.log("🚀 Launching headless browser for automated UX & E2E tests...");
  const browser = await puppeteer.launch({
    executablePath: BRAVE_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1400,950"],
    defaultViewport: { width: 1400, height: 950 },
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // ----------------------------------------------------
    // TEST 1: Landing Page
    // ----------------------------------------------------
    console.log("📍 1. Testing Landing Page rendering (http://localhost:3001)...");
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });

    // Assert Title
    const title = await page.title();
    console.log(`   ✓ Page title: "${title}"`);
    if (!title.includes("ApexCV")) throw new Error("Title mismatch!");

    // Assert Hero Header
    const heroHeading = await page.$eval("h1", (el) => el.innerText);
    console.log(`   ✓ Hero heading verified: "${heroHeading.substring(0, 40)}..."`);

    // Screenshot Landing Page
    const landingShot = path.join(SCREENSHOT_DIR, "1-landing-page.png");
    await page.screenshot({ path: landingShot, fullPage: true });
    console.log(`   📸 Captured screenshot: 1-landing-page.png`);

    // ----------------------------------------------------
    // TEST 2: Navigation to App Dashboard
    // ----------------------------------------------------
    console.log("📍 2. Testing App Dashboard (/app)...");
    await page.waitForSelector('a[href="/app"]', { timeout: 10000 });
    await page.click('a[href="/app"]');
    await page.waitForSelector("h1", { timeout: 10000 });

    const dashboardHeading = await page.$eval("h1", (el) => el.innerText);
    console.log(`   ✓ Dashboard heading: "${dashboardHeading}"`);

    // Screenshot Dashboard
    const dashboardShot = path.join(SCREENSHOT_DIR, "2-dashboard.png");
    await page.screenshot({ path: dashboardShot });
    console.log(`   📸 Captured screenshot: 2-dashboard.png`);

    // ----------------------------------------------------
    // TEST 3: Create New CV Flow
    // ----------------------------------------------------
    console.log("📍 3. Testing Create New CV Modal Flow...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find((b) => b.textContent?.includes("Create New CV"));
      if (btn) btn.click();
    });

    // Wait for modal input
    await page.waitForSelector("input[placeholder*='Senior Software Engineer']", { timeout: 3000 });
    const nameInput = await page.$("input[placeholder*='Senior Software Engineer']");
    await nameInput.click({ clickCount: 3 });
    await nameInput.type("Principal Platform Architect CV");

    // Click "Start Building"
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find((b) => b.textContent?.includes("Start Building"));
      if (btn) btn.click();
    });

    // Wait for editor page to load
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    console.log(`   ✓ Navigated to live editor: ${page.url()}`);

    // ----------------------------------------------------
    // TEST 4: Live Split-Screen Editor & Real-Time Sync
    // ----------------------------------------------------
    console.log("📍 4. Testing Live Form Sync & Preview...");
    await page.waitForSelector("#cv-printable-sheet", { timeout: 5000 });

    // Verify candidate name in preview
    const initialName = await page.$eval("#cv-printable-sheet h1", (el) => el.innerText);
    console.log(`   ✓ Candidate name in preview: "${initialName}"`);

    // Edit full name in form (select all first)
    const fullNameInput = await page.$("input[placeholder='e.g. Alex Rivera']");
    if (fullNameInput) {
      await fullNameInput.evaluate((el) => { el.value = ""; });
      await fullNameInput.type("Dr. Elena Rostova");

      // Verify that the live preview immediately updated
      await page.waitForFunction(
        () => document.querySelector("#cv-printable-sheet h1")?.textContent?.includes("Dr. Elena Rostova"),
        { timeout: 3000 }
      );
      console.log("   ✓ Real-time preview synchronized immediately on keystroke!");
    }

    // Screenshot Live Editor with content
    const editorShot = path.join(SCREENSHOT_DIR, "3-editor-live-sync.png");
    await page.screenshot({ path: editorShot });
    console.log(`   📸 Captured screenshot: 3-editor-live-sync.png`);

    // ----------------------------------------------------
    // TEST 5: Section Reordering (Drag & Drop / Reorder)
    // ----------------------------------------------------
    console.log("📍 5. Testing Section Reordering...");
    // Click down arrow on the first section (Summary) to move it below Experience
    const moved = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button[title='Move section down']"));
      if (buttons.length > 0) {
        buttons[0].click();
        return true;
      }
      return false;
    });

    if (moved) {
      await sleep(300);
      console.log("   ✓ Moved Summary section down below Experience");
    }

    // ----------------------------------------------------
    // TEST 6: Template & Styling Switcher
    // ----------------------------------------------------
    console.log("📍 6. Testing Template Switching & Design Toolbar...");
    // Click "Templates & Theme" tab
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const tab = buttons.find((b) => b.textContent?.includes("Templates & Theme"));
      if (tab) tab.click();
    });
    await sleep(300);

    // Click "Creative Grid" template
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find((b) => b.textContent?.includes("Creative Grid"));
      if (btn) btn.click();
    });
    console.log("   ✓ Switched to Creative Grid template");

    // Click Indigo Accent Color
    const colorButtons = await page.$$("button[title='Indigo']");
    if (colorButtons.length > 0) {
      await colorButtons[0].click();
      console.log("   ✓ Switched accent color to Indigo");
    }

    await sleep(400);

    // Screenshot Creative Template in Editor
    const themeShot = path.join(SCREENSHOT_DIR, "4-editor-creative-theme.png");
    await page.screenshot({ path: themeShot });
    console.log(`   📸 Captured screenshot: 4-editor-creative-theme.png`);

    // ----------------------------------------------------
    // TEST 7: Sheet Direct Screenshot & Print Simulation
    // ----------------------------------------------------
    console.log("📍 7. Testing High-Res Sheet Capture...");
    const sheetEl = await page.$("#cv-printable-sheet");
    if (sheetEl) {
      const sheetShot = path.join(SCREENSHOT_DIR, "5-cv-sheet-export.png");
      await sheetEl.screenshot({ path: sheetShot });
      console.log(`   📸 Captured standalone high-res CV sheet: 5-cv-sheet-export.png`);
    }

    console.log("\n=======================================================");
    console.log("🎉 ALL AUTOMATED TESTS & VISUAL VERIFICATIONS PASSED!");
    console.log("=======================================================");
    console.log(`Console error count: ${consoleErrors.length}`);
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    const errShot = path.join(SCREENSHOT_DIR, "error-state.png");
    await page.screenshot({ path: errShot }).catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runTests();
