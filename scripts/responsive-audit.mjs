import { createRequire } from "node:module";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";

// Supply an installed puppeteer-core directory and the app preview URL.
const require = createRequire(resolve(process.argv[2], "package.json"));
const puppeteer = require(resolve(process.argv[2]));
const base = process.argv[3] || "http://localhost:80";
const browser = await puppeteer.launch({ executablePath: "/repl/tools/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await browser.newPage();
const routes = ["/", "/pricing", "/blog", "/blog/calculate-ai-margin-per-customer", "/docs", "/docs/getting-started-developer-guide", "/tools", "/spend-checkup", "/blind-spot-quiz", "/tools/plan-pricing-margin-calculator", "/features/ai-savings", "/features/per-customer-cost-attribution", "/use-cases/founders"];
const results = [];
async function readyControl(selector) {
  // Network idle is unreliable here because background analytics keep fetching.
  // Wait until React has attached the control's handler, then allow effects to settle.
  await page.waitForFunction(selector => {
    const control = document.querySelector(selector);
    return control && Object.keys(control).some(key => key.startsWith("__reactProps$") && typeof control[key]?.onClick === "function");
  }, { timeout: 20000 }, selector);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
try {
  if (!process.argv.includes("--interactions-only")) for (const width of [320, 390, 768, 1024, 1280]) {
    await page.setViewport({ width, height: 850, isMobile: width < 768, hasTouch: width < 768 });
    for (const route of routes) {
      const response = await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForSelector(".public-site", { timeout: 30000 });
      await page.evaluate(() => document.fonts.ready);
      await new Promise(resolve => setTimeout(resolve, 180));
      const result = await page.evaluate(() => {
        const width = innerWidth;
        const overflow = [...document.querySelectorAll(".public-site *")].filter(element => {
          const rect = element.getBoundingClientRect();
          if (!rect.width || !rect.height || rect.right <= width + 1 && rect.left >= -1) return false;
          let parent = element.parentElement;
          while (parent && parent !== document.body) {
            const style = getComputedStyle(parent);
            if (["hidden", "clip", "auto", "scroll"].includes(style.overflowX)) return false;
            parent = parent.parentElement;
          }
          return true;
        }).slice(0, 8).map(element => ({ tag: element.tagName, classes: element.className?.baseVal ?? element.className, text: element.textContent?.trim().slice(0, 70), right: Math.round(element.getBoundingClientRect().right) }));
        return { viewport: width, documentWidth: document.documentElement.scrollWidth, overflow };
      });
      results.push({ route, status: response.status(), ...result });
      console.log(JSON.stringify(results.at(-1)));
    }
  }
  if (results.length) await writeFile(process.argv[4] || "/tmp/responsive-audit.json", JSON.stringify(results, null, 2));
  await page.setViewport({ width: 320, height: 568, isMobile: true, hasTouch: true });
  await page.goto(base + "/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector('button[aria-controls="public-mobile-navigation"]');
  await readyControl('button[aria-controls="public-mobile-navigation"]');
  await page.tap('button[aria-controls="public-mobile-navigation"]');
  await page.waitForSelector("#public-mobile-navigation");
  for (const label of ["Products", "Features", "Free Tools"]) {
    await page.evaluate(label => {
      const button = [...document.querySelectorAll("#public-mobile-navigation button")].find(button => button.textContent.trim() === label);
      if (!button) throw new Error("Missing navigation group: " + label);
      button.click();
    }, label);
  }
  await new Promise(resolve => setTimeout(resolve, 180));
  const menu = await page.evaluate(() => {
    const nav = document.querySelector("#public-mobile-navigation");
    const rect = nav.getBoundingClientRect();
    nav.scrollTop = nav.scrollHeight;
    const signup = nav.querySelector('a[href="/signup"]');
    const signupRect = signup.getBoundingClientRect();
    return { fitsScreen: rect.bottom <= innerHeight + 1, scrollable: nav.scrollHeight > nav.clientHeight,
      signupReachable: signupRect.top >= rect.top && signupRect.bottom <= rect.bottom + 1,
      noOverflow: document.documentElement.scrollWidth <= innerWidth };
  });
  if (!menu.fitsScreen || !menu.signupReachable || !menu.noOverflow) throw new Error("Mobile menu failure: " + JSON.stringify(menu));
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector("#public-mobile-navigation"));
  console.log("INTERACTION mobile navigation", JSON.stringify(menu), "Escape closes menu");
  await page.tap('button[aria-controls="public-mobile-navigation"]');
  await page.waitForSelector('#public-mobile-navigation a[href="/pricing"]');
  await page.$eval('#public-mobile-navigation a[href="/pricing"]', link => link.click());
  await page.waitForFunction(() => location.pathname === "/pricing" && !document.querySelector("#public-mobile-navigation"));
  console.log("INTERACTION menu link navigates and closes");
  await page.setViewport({ width: 768, height: 850, isMobile: true, hasTouch: true });
  await page.goto(base + "/docs/getting-started-developer-guide", { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[aria-label="Open docs navigation"]');
  await readyControl('[aria-label="Open docs navigation"]');
  await page.tap('[aria-label="Open docs navigation"]');
  await page.waitForSelector(".docs-mobile-sheet");
  await new Promise(resolve => setTimeout(resolve, 550));
  const docs = await page.evaluate(() => {
    const sheet = document.querySelector(".docs-mobile-sheet");
    const rect = sheet.getBoundingClientRect();
    return { fitsScreen: rect.left >= -1 && rect.right <= innerWidth + 1,
      hasDocLinks: !!sheet.querySelector('a[href^="/docs/"]') };
  });
  if (!docs.fitsScreen || !docs.hasDocLinks) throw new Error("Documentation drawer failure: " + JSON.stringify(docs));
  await page.keyboard.press("Escape");
  console.log("INTERACTION tablet documentation drawer", JSON.stringify(docs));
  await page.setViewport({ width: 320, height: 568, isMobile: true, hasTouch: true });
  await page.goto(base + "/tools/plan-pricing-margin-calculator", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".public-site");
  await readyControl('button[aria-controls="public-mobile-navigation"]');
  await page.evaluate(() => {
    const button = [...document.querySelectorAll("button")].find(button => /add.*plan/i.test(button.textContent));
    if (!button) throw new Error("Missing add-plan action");
    button.click();
  });
  await page.waitForSelector('input[placeholder="e.g. Pro"]');
  const form = await page.evaluate(() => {
    const input = document.querySelector('input[placeholder="e.g. Pro"]');
    const fields = [...document.querySelectorAll("input")].filter(input => input.getBoundingClientRect().width > 0);
    return { noOverflow: document.documentElement.scrollWidth <= innerWidth,
      readableInputs: fields.every(input => parseFloat(getComputedStyle(input).fontSize) >= 16),
      labelsStacked: fields[1].getBoundingClientRect().top < fields[2].getBoundingClientRect().top,
      nameFieldWidth: Math.round(input.getBoundingClientRect().width) };
  });
  if (!form.noOverflow || !form.readableInputs || !form.labelsStacked) throw new Error("Calculator form failure: " + JSON.stringify(form));
  console.log("INTERACTION calculator form", JSON.stringify(form));
} finally {
  await browser.close();
}
