// 가입, 로그인, 로그아웃, 계정 전환, 비밀번호 재설정, 소셜 단추, 계정 화면(닉네임, 비밀번호, 탈퇴, 인증 앱).
// 전부 이 브라우저 안의 시험 계정이다(메일을 보내지 않고, 밖으로 나가는 요청이 없다).
import { recorder, session, txt, sheetText, scrims, activeDesc, sleep, near } from "./lib.mjs";
const { check, run, save } = recorder("03-auth");
const pathOf = (page) => new URL(page.url()).pathname.replace("/voila-test-aresjoo", "");
const sheet = (page) => page.locator(".v-sheet").last();
const field = (page, i = 0) => page.locator(".v-sheet .v-input").nth(i);
const accounts = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("voila.browser-accounts.v1") || "[]").map((a) => ({ id: a.user.id, email: a.user.email, provider: a.user.provider, pending: !!a.signupPending, nickname: a.user.nickname ?? null, secret: !!a.secret, strict: !!a.strictPassword })));

await run("a1", async () => {
  const s = await session({ preset: "firstVisit", view: "mobile" });
  const page = await s.open("/ko/box/dollar-apple/");
  await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
  await page.locator(".v-header .v-headbtn").first().click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  check("a1", "로그인 시트가 열리면 이메일 칸에 포커스", (await activeDesc(page)).startsWith("INPUT"), await activeDesc(page));
  // 빈 값으로 Enter(칸을 눌러 포커스를 준 뒤)
  await field(page).click(); await page.keyboard.press("Enter"); await sleep(300);
  check("a1", "빈 이메일로 Enter: 그 자리에 실패 한 줄, 단계는 그대로", (await page.locator(".v-sheet .v-line--fail").count()) === 1 && (await page.locator(".v-sheet input[type='email']").count()) === 1, await txt(page.locator(".v-sheet .v-line--fail")));
  await s.shot(page, "03-a1-login-empty");
  // 가입으로 전환
  await page.locator(".v-sheet .v-links .v-link").click(); await sleep(250);
  check("a1", "이메일로 가입 링크: 제목이 가입으로, 실패 한 줄은 지워진다", (await sheetText(page)).startsWith("가입") && (await page.locator(".v-sheet .v-line--fail").count()) === 0);
  await field(page).fill("claude-b-one@example.invalid"); await page.keyboard.press("Enter"); await sleep(300);
  let t = await sheetText(page);
  check("a1", "이메일을 넣고 Enter: 비밀번호 단계(설명에 이메일, 12자 안내)", t.includes("claude-b-one@example.invalid") && t.includes("새 비밀번호") && t.includes("12자 이상으로 정합니다."), t.slice(0, 200));
  await s.shot(page, "03-a1-signup-password");
  // 이메일 바꾸기
  await page.locator(".v-sheet .v-links .v-link", { hasText: "이메일 바꾸기" }).click(); await sleep(250);
  check("a1", "이메일 바꾸기: 이메일 단계로 돌아가고 넣었던 이메일이 남아 있다", (await page.locator(".v-sheet input[type='email']").inputValue()) === "claude-b-one@example.invalid");
  await page.keyboard.press("Enter"); await sleep(300);
  await field(page).fill("short"); await page.keyboard.press("Enter"); await page.waitForFunction(() => /인증 코드|이메일 인증/.test(document.querySelector(".v-sheet")?.innerText || "") || document.querySelector(".v-sheet .v-line--fail"), null, { timeout: 15000 });
  t = await sheetText(page);
  check("a1", "가입 비밀번호 5자: 이 브라우저 장부는 길이를 보지 않고 다음 단계(이메일 인증)로 간다(12자 안내와 어긋난다)", t.startsWith("이메일 인증"), t.slice(0, 200));
  let acc = await accounts(page);
  check("a1", "가입 중 계정이 저장소에 생긴다(signupPending)", acc.length === 1 && acc[0].pending === true, acc);
  // 인증 코드: 숫자만, 6자
  await field(page).fill("12ab34");
  check("a1", "인증 코드 칸은 숫자만 받는다", (await field(page).inputValue()) === "1234", await field(page).inputValue());
  await page.keyboard.press("Enter"); await sleep(500);
  check("a1", "4자리 코드: 실패 한 줄(로그인되지 않는다)", (await page.locator(".v-sheet .v-line--fail").count()) === 1 && (await page.evaluate(() => localStorage.getItem("voila.browser-session.v1"))) === null, await txt(page.locator(".v-sheet .v-line--fail")));
  await page.locator(".v-sheet .v-links .v-link", { hasText: "코드 다시 받기" }).click(); await sleep(400);
  check("a1", "코드 다시 받기: 칸이 비워지고 실패 한 줄이 지워진다", (await field(page).inputValue()) === "" && (await page.locator(".v-sheet .v-line--fail").count()) === 0);
  await field(page).fill("000000"); await page.keyboard.press("Enter");
  await page.waitForSelector("[data-balance-open]", { timeout: 15000 }); await sleep(500);
  const l = await s.ledger(page);
  check("a1", "아무 6자리 코드로 가입이 끝난다: 시트가 닫히고 보던 박스 화면 그대로, 머리줄에 잔액", (await scrims(page)) === 0 && pathOf(page) === "/ko/box/dollar-apple/", { session: l.session });
  check("a1", "첫 로그인 보너스 10000 과 무료 개봉 2회가 계정 장부에 생긴다", near(l.balance, 10000) && l.bonus === 1 && l.freeOpens?.["pokemon-charizard"] === 2, { bal: l.balance, bonus: l.bonus, free: l.freeOpens, key: l.walletKey });
  await s.shot(page, "03-a1-signed-up");
  const id1 = l.session;
  // 새로 고침 뒤에도 로그인
  await page.reload({ waitUntil: "networkidle" }); await page.waitForSelector("[data-balance-open]", { timeout: 15000 });
  const l2 = await s.ledger(page);
  check("a1", "새로 고침 뒤에도 로그인과 잔액이 그대로, 보너스는 다시 붙지 않는다", l2.session === id1 && near(l2.balance, 10000) && l2.bonus === 1, { bal: l2.balance, bonus: l2.bonus });
  // 로그아웃
  await page.goto(page.url().replace("/box/dollar-apple/", "/account/"), { waitUntil: "networkidle" }); await page.waitForSelector("main .v-rows");
  await s.shot(page, "03-a1-account");
  await page.locator("main > div > .v-links .v-link").last().click(); await page.waitForSelector('[role="alertdialog"]'); await sleep(250);
  check("a1", "로그아웃은 확인창을 거친다", (await txt(page.locator('[role="alertdialog"]'))).includes("잔액과 보관함은 계정에 남습니다."));
  await page.keyboard.press("Escape"); await sleep(250);
  check("a1", "확인창에서 Esc: 로그인 그대로", (await page.evaluate(() => localStorage.getItem("voila.browser-session.v1"))) === id1);
  await page.locator("main > div > .v-links .v-link").last().click(); await page.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(250);
  await page.locator('[role="alertdialog"] .v-btn').dblclick(); await sleep(900);
  const out = await s.ledger(page);
  check("a1", "확정: 세션 키가 지워지고 화면은 로그인 한 줄로, 장부는 손님 것으로 바뀐다", out.session === null && (await txt(page.locator("main"))).includes("로그인하면 잔액과 보관함, 보안 설정이 보입니다."), { walletKey: out.walletKey, bal: out.balance });
  const kept = await page.evaluate((id) => JSON.parse(localStorage.getItem("voila.browser-wallet." + id)).state.balance, id1);
  check("a1", "로그아웃해도 계정의 장부는 저장소에 남아 있다(10000)", near(kept, 10000), kept);
  // 다른 계정으로 로그인(없는 이메일): 그 자리에서 계정이 생긴다
  await page.locator("main .v-btn").first().click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  await field(page).fill("claude-b-two@example.invalid"); await page.keyboard.press("Enter"); await sleep(300);
  check("a1", "로그인의 비밀번호 단계: 이메일 바꾸기와 비밀번호 재설정 링크", (await page.locator(".v-sheet .v-links .v-link").allInnerTexts()).join("|") === "이메일 바꾸기|비밀번호 재설정");
  await field(page).fill("x"); await page.keyboard.press("Enter");
  await page.waitForSelector("main .v-rows", { timeout: 15000 }); await sleep(500);
  const two = await s.ledger(page); acc = await accounts(page);
  check("a1", "가입한 적 없는 이메일과 한 글자 비밀번호로 로그인된다(이 브라우저 장부는 로그인이 곧 계정 만들기다)", two.session !== null && two.session !== id1 && acc.length === 2, acc);
  check("a1", "계정이 바뀌면 장부도 바뀐다: 새 계정의 보너스 10000, 무료 2회, 앞 계정의 장부는 그대로", near(two.balance, 10000) && two.bonus === 1 && two.walletKey.endsWith(two.session), { key: two.walletKey });
  // 첫 계정으로 다시, 틀린 비밀번호
  await page.locator("main > div > .v-links .v-link").last().click(); await page.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(250);
  await page.locator('[role="alertdialog"] .v-btn').click(); await sleep(900);
  await page.locator("main .v-btn").first().click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  await field(page).fill("claude-b-one@example.invalid"); await page.keyboard.press("Enter"); await sleep(300);
  await field(page).fill("totally-different-password"); await page.keyboard.press("Enter");
  await page.waitForSelector("main .v-rows", { timeout: 15000 }).catch(() => {}); await sleep(500);
  const back = await s.ledger(page);
  check("a1", "첫 계정에 가입 때와 다른 비밀번호로 로그인된다(비밀번호를 바꾸기 전에는 비밀번호를 대조하지 않는다)", back.session === id1, { session: back.session, fail: await page.locator(".v-sheet .v-line--fail").count() });
  check("a1", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// a2: 비밀번호 재설정, 소셜 단추, 닫기와 잠금
await run("a2", async () => {
  const s = await session({ preset: "firstVisit", view: "desktop" });
  const page = await s.open("/ko/account/");
  await page.waitForSelector("main .v-btn");
  check("a2", "비로그인 계정 화면: 로그인 단추와 가입 링크", (await txt(page.locator("main .v-btn"))) === "로그인" && (await txt(page.locator("main .v-links .v-link"))) === "가입");
  await page.locator("main .v-links .v-link").click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  check("a2", "가입 링크는 가입 시트를 연다", (await sheetText(page)).startsWith("가입"));
  await page.locator(".v-sheet .v-links .v-link").click(); await sleep(200);
  check("a2", "이메일로 로그인 링크로 로그인 시트가 된다", (await sheetText(page)).startsWith("로그인"));
  await field(page).fill("claude-b-reset@example.invalid"); await page.keyboard.press("Enter"); await sleep(300);
  await page.locator(".v-sheet .v-links .v-link", { hasText: "비밀번호 재설정" }).click(); await sleep(300);
  let t = await sheetText(page);
  check("a2", "비밀번호 재설정: 이메일 단계로 가고(넣은 이메일 유지) 소셜 단추가 없다", t.startsWith("비밀번호 재설정") && (await field(page).inputValue()) === "claude-b-reset@example.invalid" && !t.includes("Google로 계속하기"), t.slice(0, 200));
  await page.keyboard.press("Enter"); await page.waitForFunction(() => (document.querySelector(".v-sheet")?.innerText || "").startsWith("새 비밀번호"), null, { timeout: 15000 });
  t = await sheetText(page);
  check("a2", "코드와 새 비밀번호 단계", t.includes("인증 코드") && t.includes("새 비밀번호") && t.includes("코드 다시 받기"), t.slice(0, 200));
  await s.shot(page, "03-a2-reset");
  await field(page, 0).fill("123456"); await field(page, 1).fill("new-password-123"); await page.keyboard.press("Enter");
  await page.waitForFunction(() => (document.querySelector(".v-sheet")?.innerText || "").startsWith("비밀번호를 바꿨습니다"), null, { timeout: 20000 });
  check("a2", "끝: 비밀번호를 바꿨다는 제목과 이메일로 로그인 단추 하나", (await page.locator(".v-sheet .v-btn").allInnerTexts()).join("|") === "이메일로 로그인");
  await page.locator(".v-sheet .v-btn").click(); await sleep(250);
  check("a2", "그 단추는 로그인 시트의 처음으로 돌아간다", (await sheetText(page)).startsWith("로그인") && (await page.locator(".v-sheet input[type='email']").count()) === 1);
  // 소셜
  await page.locator(".v-sheet .v-btn--quiet").first().click();
  await page.waitForSelector("main .v-rows", { timeout: 15000 }); await sleep(400);
  const acc = await accounts(page);
  const l = await s.ledger(page);
  check("a2", "Google로 계속하기: 밖으로 나가지 않고 이 브라우저에 google@device.invalid 계정이 생겨 로그인된다", acc.some((a) => a.email === "google@device.invalid" && a.provider === "google") && l.session !== null && pathOf(page) === "/ko/account/", acc);
  await s.shot(page, "03-a2-social-account");
  // 소셜 계정의 비밀번호 시트
  await page.locator("main button.v-row", { hasText: "비밀번호" }).click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  t = await sheetText(page);
  check("a2", "소셜 계정의 비밀번호 시트: 안내 한 줄만 있고 입력칸과 단추가 없다", t.includes("소셜 계정은 그 서비스에서 비밀번호를 관리합니다.") && (await page.locator(".v-sheet .v-input").count()) === 0, t);
  await page.keyboard.press("Escape"); await sleep(250);
  check("a2", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// a3: 계정 화면의 행과 시트(닉네임, 비밀번호, 탈퇴, 인증 앱)
await run("a3", async () => {
  const s = await session({ preset: "inventory", view: "mobile" });
  const page = await s.open("/ko/account/");
  await page.waitForSelector("main .v-rows");
  const rows = await page.locator("main .v-rows a, main .v-rows button").evaluateAll((els) => els.map((e) => e.innerText.replace(/\s+/g, " ").trim() + "→" + (e.getAttribute("href")?.replace("/voila-test-aresjoo", "") ?? "button")));
  check("a3", "계정 화면의 행(링크 일곱, 단추 넷)", rows.length === 11, rows);
  // 닉네임
  await page.locator("main button.v-row", { hasText: "닉네임" }).click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  check("a3", "닉네임 시트: 지금 닉네임이 채워져 있다", (await field(page).inputValue()) === "촬영계정");
  await field(page).fill("a"); await page.locator(".v-sheet .v-btn").click(); await sleep(250);
  check("a3", "한 글자: 그 자리에 규칙 한 줄", (await txt(page.locator(".v-sheet .v-line--fail"))) === "2자 이상 20자 이하로 적습니다.");
  await field(page).fill("클로드비");
  check("a3", "고치면 실패 한 줄이 지워진다", (await page.locator(".v-sheet .v-line--fail").count()) === 0);
  await page.locator(".v-sheet .v-btn").click(); await page.waitForSelector(".v-sheet", { state: "detached", timeout: 10000 }).catch(() => {}); await sleep(300);
  const nick = await txt(page.locator("main button.v-row", { hasText: "닉네임" }));
  check("a3", "저장하면 시트가 닫히고 행에 새 닉네임", nick.includes("클로드비"), { nick, fail: await txt(page.locator(".v-sheet .v-line--fail")) });
  await page.locator("main button.v-row", { hasText: "닉네임" }).click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  const lock = await sheetText(page);
  check("a3", "바꾼 뒤 다시 열면: 다시 바꿀 수 있는 날짜 한 줄과 눌리지 않는 저장 단추", lock.includes("부터 다시 바꿀 수 있습니다.") && (await page.locator(".v-sheet .v-btn").isDisabled()), lock);
  await s.shot(page, "03-a3-nickname-locked");
  await page.keyboard.press("Escape"); await sleep(250);
  // 비밀번호
  await page.locator("main button.v-row", { hasText: "비밀번호" }).click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  check("a3", "비밀번호 시트: 입력칸 셋(현재, 새, 인증 앱 코드)", (await page.locator(".v-sheet .v-input").count()) === 3);
  await page.locator(".v-sheet .v-btn").click(); await sleep(200);
  check("a3", "빈 채로 누르면 새 비밀번호 규칙 한 줄", (await txt(page.locator(".v-sheet .v-line--fail"))) === "새 비밀번호는 12자 이상 128자 이하입니다.");
  await field(page, 0).fill("CaptureOnly123!"); await field(page, 1).fill("NewCapture12345!");
  await page.locator(".v-sheet .v-btn").click(); await sleep(200);
  check("a3", "코드가 없으면 코드 규칙 한 줄", (await txt(page.locator(".v-sheet .v-line--fail"))) === "인증 앱 코드 6자리를 넣습니다.");
  await field(page, 2).fill("123456"); await page.locator(".v-sheet .v-btn").click();
  await page.waitForFunction(() => { const s = document.querySelector(".v-sheet"); return !s || s.querySelector(".v-line--fail"); }, null, { timeout: 20000 }); await sleep(300);
  const pw = { open: await page.locator(".v-sheet").count(), line: await txt(page.locator(".v-sheet .v-line--fail")), strict: (await accounts(page))[0]?.strict };
  check("a3", "올바른 현재 비밀번호, 새 비밀번호, 6자리 코드로도 비밀번호가 바뀌지 않는다(이 화면은 현재 비밀번호 확인 단계를 부르지 않는다)", pw.open === 1 && pw.line.length > 0 && pw.strict === false, pw);
  await s.shot(page, "03-a3-password-fail");
  await page.keyboard.press("Escape"); await sleep(250);
  // 탈퇴
  await page.locator("main button.v-row", { hasText: "탈퇴" }).click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  check("a3", "탈퇴 시트: 비밀번호를 넣기 전에는 단추가 눌리지 않는다", await page.locator(".v-sheet .v-btn").isDisabled());
  await field(page).fill("CaptureOnly123!"); await page.locator(".v-sheet .v-btn").click(); await page.waitForSelector('[role="alertdialog"]'); await sleep(250);
  check("a3", "탈퇴는 확인창을 거친다", (await txt(page.locator('[role="alertdialog"]'))).includes("되돌릴 수 없습니다."));
  await s.shot(page, "03-a3-close-confirm");
  await page.locator('[role="alertdialog"] .v-link').click(); await sleep(250);
  check("a3", "취소하면 탈퇴 시트로 돌아오고 비밀번호가 남아 있다", (await field(page).inputValue()) === "CaptureOnly123!");
  await page.locator(".v-sheet .v-btn").click(); await page.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(250);
  await page.locator('[role="alertdialog"] .v-btn').click();
  await page.waitForFunction(() => !document.querySelector('[role="alertdialog"]'), null, { timeout: 15000 }); await sleep(400);
  const cl = { line: await txt(page.locator(".v-sheet .v-line--fail")), accounts: (await accounts(page)).length, session: await page.evaluate(() => localStorage.getItem("voila.browser-session.v1")) };
  check("a3", "확정해도 탈퇴되지 않는다: 실패 한 줄, 계정과 세션 그대로(이 브라우저 장부는 옛 탈퇴 주소를 받지 않는다)", cl.line.length > 0 && cl.accounts === 1 && cl.session === "capture-account", cl);
  await s.shot(page, "03-a3-close-fail");
  await page.keyboard.press("Escape"); await sleep(250);
  // 인증 앱
  await page.locator("main button.v-row", { hasText: "인증 앱" }).click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  let t = await sheetText(page);
  check("a3", "인증 앱 시트: 안내와 시작 단추", (await page.locator(".v-sheet .v-btn").count()) === 1, t.slice(0, 200));
  await page.locator(".v-sheet .v-btn").click(); await page.waitForSelector(".v-sheet .v-qr", { timeout: 10000 }); await sleep(250);
  check("a3", "시작: QR, 직접 넣는 키, 코드 칸. 코드가 6자리가 될 때까지 확인 단추가 눌리지 않는다", (await page.locator(".v-sheet .v-address").count()) === 1 && (await page.locator(".v-sheet button[type='submit']").isDisabled()));
  await s.shot(page, "03-a3-totp-setup");
  await page.locator(".v-sheet .v-input").fill("12a3456789");
  check("a3", "코드 칸에 12a3456789 를 넣었을 때 남는 값(본 것)", "info", await page.locator(".v-sheet .v-input").inputValue());
  await page.locator(".v-sheet .v-input").fill("123456");
  check("a3", "숫자 6자리를 넣으면 확인 단추가 눌린다", await page.locator(".v-sheet button[type='submit']").isEnabled());
  await page.keyboard.press("Enter");
  await page.waitForSelector(".v-sheet", { state: "detached", timeout: 15000 }).catch(() => {}); await sleep(300);
  const tf = await txt(page.locator("main button.v-row", { hasText: "인증 앱" }));
  check("a3", "아무 6자리 코드로 연결된다(이 브라우저 장부): 시트가 닫히고 행이 연결됨", tf.includes("연결됨") && (await accounts(page))[0].secret === true, tf);
  check("a3", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

await save();
