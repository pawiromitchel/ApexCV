import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

/**
 * Renders every icon and the social share image from public/favicon.svg.
 * Run with: node scripts/generate-favicons.mjs
 */
const BRAVE_PATH = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";
const svg = fs.readFileSync(path.resolve("public/favicon.svg"), "utf-8");

// Full-bleed variant: square gradient with no rounded corners or border. iOS and Android
// apply their own mask, so transparent corners would show up as black.
const fullBleed = (glyphScale = 1) =>
  svg
    .replace(/<rect x="2" y="2" width="60" height="60" rx="15" fill="url\(#bg\)" \/>/, '<rect x="0" y="0" width="64" height="64" fill="url(#bg)" />')
    .replace(/<rect x="2\.5"[^>]*\/>/, "")
    .replace('<g filter="url(#shadow)">', `<g filter="url(#shadow)" transform="translate(32 32) scale(${glyphScale}) translate(-32 -32)">`);

const page = (body, w, h, bg = "transparent") => `<!DOCTYPE html><html><head><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${w}px;height:${h}px;overflow:hidden;background:${bg}}
  svg{width:100%;height:100%;display:block}
</style></head><body>${body}</body></html>`;

const ICONS = [
  { name: "favicon-16x16.png", size: 16, svg },
  { name: "favicon-32x32.png", size: 32, svg },
  { name: "favicon-48x48.png", size: 48, svg },
  { name: "icon-192.png", size: 192, svg },
  { name: "icon-512.png", size: 512, svg },
  { name: "apple-touch-icon.png", size: 180, svg: fullBleed(1) },
  // Android maskable icons keep the glyph inside the 80% safe zone
  { name: "icon-maskable-192.png", size: 192, svg: fullBleed(0.8) },
  { name: "icon-maskable-512.png", size: 512, svg: fullBleed(0.8) },
];

const docLines = (widths) => widths.map((w) => `<div class="line" style="width:${w}%"></div>`).join("");

const OG_HTML = `<!DOCTYPE html><html><head><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;
    background:radial-gradient(70% 90% at 85% 0%,rgba(14,165,233,.35),transparent 60%),radial-gradient(60% 80% at 0% 100%,rgba(16,185,129,.18),transparent 60%),#070b14;color:#f1f5f9;display:flex;align-items:center;padding:0 80px;gap:56px}
  .left{flex:1}
  .brand{display:flex;align-items:center;gap:18px;margin-bottom:44px}
  .brand svg{width:76px;height:76px}
  .brand span{font-size:40px;font-weight:700;letter-spacing:-.5px}
  h1{font-size:60px;line-height:1.06;font-weight:700;letter-spacing:-1.5px}
  p{margin-top:24px;font-size:26px;color:#94a3b8}
  .pills{display:flex;gap:12px;margin-top:40px}
  .pill{font-size:21px;padding:9px 18px;border-radius:999px;border:1px solid rgba(148,163,184,.3);color:#cbd5e1}
  .sheet{width:330px;height:440px;background:#fff;border-radius:10px;box-shadow:0 40px 80px -20px rgba(0,0,0,.6);padding:34px 30px;transform:rotate(3deg)}
  .name{height:18px;width:62%;background:#0f172a;border-radius:4px}
  .role{height:10px;width:44%;background:#0284c7;border-radius:4px;margin-top:10px}
  .hr{height:1px;background:#e2e8f0;margin:20px 0 16px}
  .h{height:8px;width:32%;background:#0284c7;border-radius:3px;margin:16px 0 10px}
  .line{height:7px;background:#e2e8f0;border-radius:3px;margin-top:8px}
</style></head><body>
  <div class="left">
    <div class="brand">${svg}<span>ApexCV</span></div>
    <h1>Write a CV you’re<br/>proud to send.</h1>
    <p>Live preview · ATS-friendly templates · PDF export</p>
    <div class="pills"><div class="pill">Free</div><div class="pill">No account</div><div class="pill">apexcvbuilder.com</div></div>
  </div>
  <div class="sheet">
    <div class="name"></div><div class="role"></div><div class="hr"></div>
    <div class="h"></div>${docLines([96, 88, 70])}
    <div class="h"></div>${docLines([92, 84, 90, 60])}
    <div class="h"></div>${docLines([80, 94, 72])}
  </div>
</body></html>`;

async function generate() {
  const browser = await puppeteer.launch({ executablePath: BRAVE_PATH, headless: "new", args: ["--no-sandbox"] });
  const tab = await browser.newPage();

  for (const icon of ICONS) {
    await tab.setViewport({ width: icon.size, height: icon.size, deviceScaleFactor: 1 });
    await tab.setContent(page(icon.svg, icon.size, icon.size), { waitUntil: "load" });
    await tab.screenshot({ path: path.resolve(`public/${icon.name}`), omitBackground: true });
    console.log(`✓ public/${icon.name}`);
  }
  // Modern browsers accept PNG data in favicon.ico
  fs.copyFileSync(path.resolve("public/favicon-32x32.png"), path.resolve("public/favicon.ico"));
  console.log("✓ public/favicon.ico");

  await tab.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await tab.setContent(OG_HTML, { waitUntil: "load" });
  await tab.screenshot({ path: path.resolve("public/og-image.png") });
  console.log("✓ public/og-image.png (1200x630)");

  await browser.close();
}

generate().catch((err) => {
  console.error("Error generating icons:", err);
  process.exitCode = 1;
});
