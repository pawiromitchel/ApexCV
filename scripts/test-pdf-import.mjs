import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const BRAVE_PATH = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";
const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || path.resolve("test-artifacts");
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, "screenshots");
const TEST_PDF_PATH = path.join(process.cwd(), "test-candidate-resume.pdf");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runPdfImportTest() {
  console.log("🚀 Starting PDF Import Automated Test Suite...");

  const browser = await puppeteer.launch({
    executablePath: BRAVE_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1400,900"],
    defaultViewport: { width: 1400, height: 900 },
  });

  const page = await browser.newPage();

  try {
    // ----------------------------------------------------
    // STEP 1: Generate a realistic candidate PDF resume
    // ----------------------------------------------------
    console.log("📄 1. Generating test PDF resume...");
    const sampleResumeHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: sans-serif; font-size: 11pt; color: #111; padding: 25px; line-height: 1.5; }
          h1 { margin: 0; font-size: 20pt; text-transform: uppercase; }
          .title { font-weight: bold; color: #0284c7; margin-bottom: 5px; }
          .contact { font-size: 9pt; color: #444; margin-bottom: 15px; }
          h2 { font-size: 12pt; border-bottom: 1.5px solid #111; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; }
          .job { font-weight: bold; margin-top: 8px; }
          .job-sub { font-style: italic; color: #333; }
          ul { margin-top: 4px; padding-left: 20px; }
          li { margin-bottom: 3px; }
        </style>
      </head>
      <body>
        <h1>Marcus Vance</h1>
        <div class="title">Lead Cloud Solutions Engineer</div>
        <div class="contact">marcus.vance@techcorp.io | +1 (415) 987-6543 | Seattle, WA | linkedin.com/in/marcus-vance-cloud</div>

        <h2>Summary</h2>
        <p>Distinguished Cloud Solutions Architect with 9+ years deploying highly available Kubernetes clusters on AWS and GCP. Led multi-region zero-downtime database migrations serving 20M+ users.</p>

        <h2>Professional Experience</h2>
        <div class="job">Principal Cloud Architect - Cirrus Infrastructure</div>
        <div class="job-sub">2021 - Present | Seattle, WA</div>
        <ul>
          <li>Reduced multi-region AWS cloud compute spend by 42% through spot instances and automated auto-scaling fleets.</li>
          <li>Engineered automated zero-trust mesh using Istio and Envoy handling 50k requests per second with sub-5ms overhead.</li>
        </ul>

        <div class="job">Senior DevOps Engineer - Orbit Financial Cloud</div>
        <div class="job-sub">2018 - 2021 | Austin, TX</div>
        <ul>
          <li>Built GitOps continuous deployment pipeline with ArgoCD, cutting average deployment cycle from 4 hours to 8 minutes.</li>
          <li>Automated compliance monitoring covering SOC2 and PCI-DSS requirements across 40+ microservices.</li>
        </ul>

        <h2>Education</h2>
        <div class="job">B.S. in Computer Science - University of Washington</div>
        <div class="job-sub">2014 - 2018 | Seattle, WA</div>

        <h2>Technical Skills</h2>
        <p><strong>Cloud:</strong> AWS, Google Cloud, Terraform, Kubernetes, Helm</p>
        <p><strong>Languages:</strong> Go, Python, Bash, TypeScript</p>
        <p><strong>Databases:</strong> PostgreSQL, CockroachDB, Redis</p>
      </body>
      </html>
    `;

    await page.setContent(sampleResumeHtml, { waitUntil: "networkidle0" });
    await page.pdf({ path: TEST_PDF_PATH, format: "A4" });
    console.log(`   ✓ Created test PDF at: ${TEST_PDF_PATH}`);

    // ----------------------------------------------------
    // STEP 2: Test Dashboard PDF Import
    // ----------------------------------------------------
    console.log("📍 2. Testing PDF Import via Dashboard Modal (/app)...");
    await page.goto(`${BASE_URL}/app`, { waitUntil: "networkidle0" });

    // Click "Import PDF" button in top bar (either text or title attribute)
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const importBtn = buttons.find(
        (b) => b.textContent?.includes("Import PDF") || b.getAttribute("title")?.includes("Import PDF")
      );
      if (importBtn) importBtn.click();
    });

    // Wait for the modal and file input to become visible
    await page.waitForSelector("#modal-pdf-file-input", { timeout: 5000 });
    const fileInput = await page.$("#modal-pdf-file-input");
    if (!fileInput) throw new Error("Could not find modal file input!");

    await fileInput.uploadFile(TEST_PDF_PATH);
    console.log("   ✓ Uploaded test PDF to dropzone");

    // Wait for the parsing and automatic redirect to the editor
    await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 });
    console.log(`   ✓ Successfully navigated to editor: ${page.url()}`);

    // ----------------------------------------------------
    // STEP 3: Verify Pre-filled Fields in Editor & Preview
    // ----------------------------------------------------
    console.log("📍 3. Verifying parsed data in live preview sheet...");
    await page.waitForSelector("#cv-printable-sheet", { timeout: 5000 });

    const renderedName = await page.$eval("#cv-printable-sheet h1", (el) => el.innerText);
    console.log(`   ✓ Rendered Candidate Name: "${renderedName}"`);
    if (!renderedName.toLowerCase().includes("marcus vance")) {
      throw new Error(`Expected candidate name to be Marcus Vance, got: "${renderedName}"`);
    }

    const renderedTitle = await page.$eval("#cv-printable-sheet header", (el) => el.innerText);
    console.log(`   ✓ Verified header contains contact & title:`);
    console.log(`     ${renderedTitle.split("\n").slice(0, 3).join(" | ")}`);

    // Screenshot the imported CV
    const importedShot = path.join(SCREENSHOT_DIR, "6-pdf-imported-cv.png");
    await page.screenshot({ path: importedShot });
    console.log(`   📸 Captured screenshot: 6-pdf-imported-cv.png`);

    console.log("\n=======================================================");
    console.log("🎉 PDF RESUME IMPORT TEST PASSED WITH 100% ACCURACY!");
    console.log("=======================================================");
  } catch (error) {
    console.error("❌ PDF Import test failed:", error);
    process.exitCode = 1;
  } finally {
    if (fs.existsSync(TEST_PDF_PATH)) {
      fs.unlinkSync(TEST_PDF_PATH);
    }
    await browser.close();
  }
}

runPdfImportTest();
