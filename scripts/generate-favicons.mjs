import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const BRAVE_PATH = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";
const svgPath = path.resolve("public/favicon.svg");
const svgContent = fs.readFileSync(svgPath, "utf-8");

async function generate() {
  console.log("Rendering high-res icons from SVG using headless browser...");
  const browser = await puppeteer.launch({
    executablePath: BRAVE_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  const sizes = [
    { name: "favicon-16x16.png", size: 16 },
    { name: "favicon-32x32.png", size: 32 },
    { name: "favicon-48x48.png", size: 48 },
    { name: "apple-touch-icon.png", size: 180 },
    { name: "icon-192.png", size: 192 },
    { name: "icon-512.png", size: 512 },
  ];

  for (const item of sizes) {
    await page.setViewport({ width: item.size, height: item.size, deviceScaleFactor: 1 });
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { width: ${item.size}px; height: ${item.size}px; overflow: hidden; background: transparent; }
            svg { width: 100%; height: 100%; display: block; }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
      </html>
    `;
    await page.setContent(html, { waitUntil: "load" });
    const outPath = path.resolve(`public/${item.name}`);
    await page.screenshot({ path: outPath, omitBackground: true });
    console.log(`✓ Generated: public/${item.name} (${item.size}x${item.size})`);
  }

  // Generate favicon.ico by copying 32x32 or 48x48 PNG (modern browsers and OS natively accept PNG formatted favicon.ico)
  fs.copyFileSync(path.resolve("public/favicon-32x32.png"), path.resolve("public/favicon.ico"));
  console.log("✓ Generated: public/favicon.ico");

  await browser.close();
  console.log("All icons generated successfully!");
}

generate().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
