// 배포 사이트가 뜨는지, 어떤 박스가 있는지, 머리줄이 폭마다 어떻게 보이는지 먼저 본다(다른 스크립트의 전제 확인).
import { recorder, session, BASE, txt } from "./lib.mjs";
const { check, run, save } = recorder("00-probe");

await run("probe", async () => {
  for (const view of ["mobile", "desktop"]) {
    const s = await session({ preset: "guest", view });
    const page = await s.open("/ko/");
    const info = await page.evaluate(() => {
      const vis = (sel) => { const e = document.querySelector(sel); if (!e) return "absent"; const r = e.getBoundingClientRect(); const st = getComputedStyle(e); return st.display === "none" || st.visibility === "hidden" || r.width === 0 ? "hidden" : "visible"; };
      return {
        title: document.title, lang: document.documentElement.lang, nav: vis(".v-nav"), menuBtn: vis(".v-menu-btn"), hero: vis(".v-hero"),
        headBtns: [...document.querySelectorAll(".v-header .v-headbtn")].map((b) => (b.innerText || b.getAttribute("aria-label") || "").trim()),
        chips: [...document.querySelectorAll(".v-chips .v-chip")].map((b) => b.innerText.trim()),
        cards: document.querySelectorAll(".v-boxgrid .v-boxcard").length,
        firstCards: [...document.querySelectorAll(".v-boxgrid .v-boxcard")].slice(0, 6).map((a) => a.getAttribute("href")),
        more: document.querySelector(".v-btn--quiet")?.innerText ?? null,
        footerLinks: [...document.querySelectorAll(".v-footer a, .v-footer button")].map((a) => (a.innerText || a.getAttribute("aria-label") || "").trim() + "→" + (a.getAttribute("href") ?? "button")),
        labLine: !!document.querySelector(".fixed.inset-x-0.top-0"),
      };
    });
    check("probe", `홈 ${view} 구조`, "info", info);
    await s.shot(page, `00-home-${view}`);
    await s.context.close();
  }
  // 옛 박스 주소와 새 박스 주소
  const s = await session({ preset: "funded", view: "mobile" });
  for (const slug of ["dollar-apple", "vault-gold", "vault-handbag", "pokemon-charizard", "vault-pokemon"]) {
    const page = await s.open(`/ko/box/${slug}/`);
    const bar = await txt(page.locator(".v-openbar"));
    const title = await txt(page.locator("h1.v-title"));
    check("probe", `박스 ${slug}`, "info", { url: page.url(), title, bar: bar.slice(0, 160) });
    await page.close();
  }
  const page = await s.open("/ko/wallet/");
  check("probe", "지갑(funded)", "info", (await txt(page.locator("main"))).slice(0, 300));
  check("probe", "저장 키", "info", (await s.ledger(page)).keys);
  check("probe", "콘솔 오류", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});
console.log("base", BASE);
await save();
