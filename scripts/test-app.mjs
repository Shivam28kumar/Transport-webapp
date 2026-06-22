import { chromium } from "playwright-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const baseURL = "http://localhost:3000";
let failed = false;

function ok(label) {
  console.log(`PASS: ${label}`);
}
function bad(label, detail) {
  failed = true;
  console.log(`FAIL: ${label} -- ${detail ?? ""}`);
}

const browser = await chromium.launch({ executablePath: EDGE_PATH, headless: true });

// ---- Test 1: Login page loads, no console errors, form is interactive ----
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  await page.goto(`${baseURL}/login`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Welcome back");
  ok("Login page renders");

  await page.fill('input[placeholder="admin"]', "wrong-user");
  await page.fill('input[placeholder="••••••••"]', "wrong-pass");
  await page.click('button:has-text("Access Dashboard")');
  await page.waitForSelector("text=Invalid username or password", { timeout: 8000 }).then(
    () => ok("Invalid login shows error message (API + UI wiring works)"),
    (e) => bad("Invalid login error message", e.message)
  );

  const realErrors = consoleErrors.filter((e) => !e.includes("401"));
  if (realErrors.length) {
    bad("Login page console errors", JSON.stringify(realErrors));
  } else {
    ok("No unexpected console errors on login page (401 from the deliberate bad-login attempt is expected)");
  }
  await page.close();
}

// ---- Test 2: Protected routes redirect unauthenticated users ----
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(`${baseURL}/dashboard`, { waitUntil: "networkidle" });
  const url = page.url();
  if (url.includes("/login")) {
    ok("Unauthenticated /dashboard redirects to /login");
  } else {
    bad("Unauthenticated /dashboard redirect", `ended up at ${url}`);
  }
  await page.close();
}

// ---- Test 3: Authenticated session (fabricated cookie) - navigate via sidebar links ----
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addCookies([
    {
      name: "auth_session",
      value: JSON.stringify({ id: "preview", username: "preview", name: "Preview User", role: "Admin" }),
      domain: "localhost",
      path: "/",
    },
  ]);
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  await page.goto(`${baseURL}/dashboard`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Command Center").then(
    () => ok("Dashboard page renders (authenticated)"),
    (e) => bad("Dashboard render", e.message)
  );

  for (const [label, linkText] of [["Fleet", "Fleet Registry"], ["Trips", "Trip Dispatch"], ["Ledger", "Financial Ledger"]]) {
    await page.click(`aside a:has-text("${label}")`);
    await page.waitForSelector(`text=${linkText}`, { timeout: 8000 }).then(
      () => ok(`Sidebar nav -> ${label} works`),
      (e) => bad(`Sidebar nav -> ${label}`, e.message)
    );
  }

  // Sidebar collapse toggle — verify width actually changes, not just "didn't throw"
  const aside = page.locator("aside");
  const widthBefore = await aside.evaluate((el) => el.getBoundingClientRect().width);
  await page.locator("aside button").last().click();
  await page.waitForTimeout(400); // CSS width transition
  const widthAfter = await aside.evaluate((el) => el.getBoundingClientRect().width);
  if (widthAfter !== widthBefore) {
    ok(`Sidebar collapse toggle works (${widthBefore}px -> ${widthAfter}px)`);
  } else {
    bad("Sidebar collapse toggle", `width unchanged at ${widthBefore}px`);
  }

  if (consoleErrors.length) {
    bad("Authenticated pages console errors", JSON.stringify(consoleErrors.slice(0, 5)));
  } else {
    ok("No console errors across authenticated navigation");
  }
  await page.close();
  await context.close();
}

// ---- Test 4: Mobile - hamburger menu opens and nav works ----
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addCookies([
    {
      name: "auth_session",
      value: JSON.stringify({ id: "preview", username: "preview", name: "Preview User", role: "Admin" }),
      domain: "localhost",
      path: "/",
    },
  ]);
  const page = await context.newPage();
  await page.goto(`${baseURL}/dashboard`, { waitUntil: "networkidle" });
  await page.click("header button:has(svg)");
  await page.waitForSelector("text=Platform Nav", { timeout: 5000 }).then(
    () => ok("Mobile hamburger menu opens"),
    (e) => bad("Mobile hamburger menu", e.message)
  );
  // Scope to the open sheet/dialog popup specifically — "Fleet" also matches a
  // hidden (display:none) link in the desktop sidebar and the bottom nav bar.
  // Assert via URL, since "Fleet Registry" text legitimately appears twice in the
  // DOM (the page's own heading, plus a hidden md:block header title at this width).
  await page.click('[data-slot="sheet-content"] a:has-text("Fleet")');
  await page.waitForURL("**/fleet", { timeout: 8000 }).then(
    () => ok("Mobile sheet nav -> Fleet works"),
    (e) => bad("Mobile sheet nav -> Fleet", e.message)
  );
  await page.close();
  await context.close();
}

await browser.close();

console.log(failed ? "\n=== RESULT: FAILURES PRESENT ===" : "\n=== RESULT: ALL PASS ===");
process.exit(failed ? 1 : 0);
