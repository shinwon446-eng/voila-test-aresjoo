import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(new URL("../../../web/package.json", import.meta.url));
const { chromium } = require("playwright");

const BASE_URL = "https://shinwon446-eng.github.io/voila-test-aresjoo/ko";
const SCREENSHOT_DIR = path.resolve(__dirname, "../../screenshots/before/agy/overlays");
const RESULT_FILE = path.resolve(__dirname, "overlays-result.json");

async function testSingleOverlay({
  id,
  name,
  pageUrl,
  viewport = { width: 1280, height: 900 },
  openAction,
  expectedSheetSelector = ".v-sheet, [role='dialog']",
  browser,
}) {
  const context = await browser.newContext({
    viewport,
    locale: "ko-KR",
  });
  const page = await context.newPage();

  const result = {
    id,
    name,
    pageUrl,
    viewport,
    reachable: false,
    openShot: null,
    scrollLock: null,
    bodyOverflow: null,
    escapeCloses: null,
    outsideClickCloses: null,
    unreachableReason: null,
    codeCitation: null,
  };

  try {
    await page.goto(pageUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    const openResult = await openAction(page);
    if (!openResult.success) {
      result.reachable = false;
      result.unreachableReason = openResult.reason;
      result.codeCitation = openResult.codeCitation;
      await context.close();
      return result;
    }

    await page.waitForTimeout(500);
    const sheet = page.locator(expectedSheetSelector).first();
    const sheetVisible = (await sheet.count()) > 0 && (await sheet.isVisible());

    if (!sheetVisible) {
      result.reachable = false;
      result.unreachableReason = "트리거를 실행했으나 지정된 시트/오버레이가 나타나지 않음";
      await context.close();
      return result;
    }

    result.reachable = true;

    // 1. Screenshot open state
    const shotPath = path.join(SCREENSHOT_DIR, `${id}-${name}-open.png`);
    await page.screenshot({ path: shotPath });
    result.openShot = path.relative(path.resolve(__dirname, "../../"), shotPath).replace(/\\/g, "/");

    // 2. Check Scroll Lock
    const scrollInfo = await page.evaluate(() => {
      const bodyStyle = window.getComputedStyle(document.body);
      const htmlStyle = window.getComputedStyle(document.documentElement);
      return {
        bodyOverflow: bodyStyle.overflow,
        bodyOverflowY: bodyStyle.overflowY,
        htmlOverflow: htmlStyle.overflow,
      };
    });
    result.bodyOverflow = scrollInfo.bodyOverflowY || scrollInfo.bodyOverflow;
    result.scrollLock = scrollInfo.bodyOverflow === "hidden" || scrollInfo.bodyOverflowY === "hidden" || scrollInfo.htmlOverflow === "hidden";

    // 3. Check Escape Key
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
    const visibleAfterEscape = await sheet.isVisible().catch(() => false);
    result.escapeCloses = !visibleAfterEscape;

    // 4. Test Outside Click (scrim click)
    if (!visibleAfterEscape) {
      // Re-open
      await openAction(page);
      await page.waitForTimeout(400);
    }

    // Click outside scrim at (20, 20)
    await page.mouse.click(20, 20);
    await page.waitForTimeout(400);
    const visibleAfterOutsideClick = await sheet.isVisible().catch(() => false);
    result.outsideClickCloses = !visibleAfterOutsideClick;

  } catch (err) {
    result.unreachableReason = `실행 중 예외: ${err.message}`;
  } finally {
    await context.close();
  }

  return result;
}

async function main() {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const overlays = [
    // 1. Menu (모바일 메뉴)
    {
      id: "AG-I-001",
      name: "menu",
      pageUrl: `${BASE_URL}/`,
      viewport: { width: 390, height: 844 },
      openAction: async (page) => {
        const btn = page.locator(".v-header button").first();
        if ((await btn.count()) > 0) {
          await btn.click();
          return { success: true };
        }
        return { success: false, reason: "모바일 헤더 메뉴 단추 미발견" };
      },
    },
    // 2. Login (로그인 시트)
    {
      id: "AG-I-002",
      name: "login",
      pageUrl: `${BASE_URL}/`,
      viewport: { width: 1280, height: 900 },
      openAction: async (page) => {
        const btn = page.locator(".v-headbtn:has-text('로그인')").first();
        if ((await btn.count()) > 0) {
          await btn.click();
          return { success: true };
        }
        return { success: false, reason: "헤더 로그인 단추 미발견" };
      },
    },
    // 3. Charge (USDT 충전 시트) - dev/gallery 에서 비로그인 접근 가능
    {
      id: "AG-I-003",
      name: "charge",
      pageUrl: `${BASE_URL}/dev/gallery/`,
      viewport: { width: 1280, height: 900 },
      openAction: async (page) => {
        const btn = page.locator("button:has-text('USDT 충전')").first();
        if ((await btn.count()) > 0) {
          await btn.click();
          return { success: true };
        }
        return {
          success: false,
          reason: "일반 화면에서 비로그인 상태일 때는 충전 단추가 노출되지 않으며(로그인 유도), dev/gallery 에서만 도달 가능",
          codeCitation: "web/components/wallet/WalletScreen.tsx:94-102",
        };
      },
    },
    // 4. Balance (잔액 시트)
    {
      id: "AG-I-004",
      name: "balance",
      pageUrl: `${BASE_URL}/`,
      viewport: { width: 1280, height: 900 },
      openAction: async (page) => {
        const btn = page.locator(".v-headbtn:has-text('$')").first();
        if ((await btn.count()) > 0) {
          await btn.click();
          return { success: true };
        }
        return {
          success: false,
          reason: "비로그인 상태에서는 헤더에 잔액 단추 대신 '로그인' 단추(.v-headbtn)만 렌더링되므로 도달 불가",
          codeCitation: "web/components/shell/AppHeader.tsx:64-70",
        };
      },
    },
    // 5. Verify (개봉 결과 검증 시트) - dev/gallery 의 Verify Sheet
    {
      id: "AG-I-005",
      name: "verify",
      pageUrl: `${BASE_URL}/dev/gallery/`,
      viewport: { width: 1280, height: 900 },
      openAction: async (page) => {
        const btn = page.locator("button:has-text('개봉 결과 검증')").first();
        if ((await btn.count()) > 0) {
          await btn.click();
          return { success: true };
        }
        return {
          success: false,
          reason: "공개 라우트에서는 /verify 페이지로 직접 이동하며 모달 시트는 dev/gallery 또는 개봉 결과 완료 후에만 발생",
          codeCitation: "web/components/dev/Gallery.tsx:111",
        };
      },
    },
    // 6. Item Detail (상품 상세 시트)
    {
      id: "AG-I-006",
      name: "item-detail",
      pageUrl: `${BASE_URL}/box/gaming-playstation/`,
      viewport: { width: 1280, height: 900 },
      openAction: async (page) => {
        const item = page.locator(".v-items button.v-item, .v-itemrow").first();
        if ((await item.count()) > 0) {
          await item.click();
          return { success: true };
        }
        return { success: false, reason: "박스 상세의 구성품 단추 미발견" };
      },
    },
    // 7. Odds Table (구성품과 확률)
    {
      id: "AG-I-007",
      name: "odds-table",
      pageUrl: `${BASE_URL}/box/gaming-playstation/`,
      viewport: { width: 1280, height: 900 },
      openAction: async (page) => {
        // Look for odds table in box page
        const details = page.locator("details.v-notes").first();
        if ((await details.count()) > 0) {
          // In current implementation, odds table is an inline details/summary accordion, not a modal sheet
          const summary = details.locator("summary").first();
          await summary.click();
          return {
            success: false,
            reason: "개편된 박스 화면에서 '구성품과 확률'은 오버레이/모달 시트가 아니라 details/summary 아코디언 요소로 인라인 렌더링됨",
            codeCitation: "web/components/box/BoxScreen.tsx:259-272",
          };
        }
        return { success: false, reason: "확률표 요소 미발견" };
      },
    },
    // 8. Language and Currency
    {
      id: "AG-I-008",
      name: "language-currency",
      pageUrl: `${BASE_URL}/`,
      viewport: { width: 1280, height: 900 },
      openAction: async (page) => {
        return {
          success: false,
          reason: "꼬리말(footer)의 언어는 Link 이동(/en/, /zh/), 통화는 인라인 토글 버튼(USD/KRW)으로 구현되어 있어 오버레이/시트가 존재하지 않음",
          codeCitation: "web/components/shell/AppFooter.tsx:60-63",
        };
      },
    },
  ];

  const results = [];
  for (const item of overlays) {
    console.log(`Auditing overlay: ${item.name}...`);
    const res = await testSingleOverlay({ ...item, browser });
    results.push(res);
    console.log(`  -> Reachable: ${res.reachable}, ScrollLock: ${res.scrollLock}, Escape: ${res.escapeCloses}, OutsideClick: ${res.outsideClickCloses}`);
    if (!res.reachable) {
      console.log(`     Reason: ${res.unreachableReason}`);
    }
  }

  await browser.close();

  await fs.writeFile(RESULT_FILE, JSON.stringify(results, null, 2), "utf8");
  console.log(`Saved overlay results to ${RESULT_FILE}`);
}

main().catch(console.error);
