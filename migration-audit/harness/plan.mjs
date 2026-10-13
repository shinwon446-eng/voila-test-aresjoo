/**
 * 촬영 계획. 코드가 아니라 자료다. 항목을 늘리려면 아래 표에 줄을 더한다.
 *
 * 항목 하나 = 컨텍스트 하나(새 브라우저 상태) + 주소 하나 + 단계들.
 *   { id, group, routeKey, route, locale, width, preset, patch?, motion?, steps[] }
 * 단계(do):
 *   shot     { name, full?, clip?, pad? }   full: 문서 전체. clip: 그 요소 둘레만(pad px 여유).
 *   click    { sel, nth?, optional? }       optional: 요소가 보이지 않으면 그 항목의 남은 단계를 "해당 없음"으로 적고 끝낸다.
 *   fill     { sel, nth?, value, optional? }  value 가 '@password', '@wrong-password', '@totp' 이면 shots.mjs 가 시험 계정의 값으로 채운다
 *   goto     { route }                      같은 언어의 다른 화면으로 주소 이동(저장소는 그대로)
 *   press    { key }                        키보드
 *   hover    { sel, nth? }
 *   focus    { sel, nth? }                  Tab 을 한 번 눌러 키보드 방식으로 바꾼 뒤 그 요소에 포커스를 준다(:focus-visible 이 보이게).
 *   hold     { sel, nth? } / release        누른 채로 두기(:active), 떼기(요소 밖에서 떼어 클릭이 되지 않게 한다)
 *   wait     { sel, state?, timeout? } 또는 { ms }
 *   scroll   { sel, nth? } 또는 { y }       y: 숫자 또는 'bottom'
 *   open     { sel }                        details 요소를 전부 편다
 * 선택자는 언어와 상관없는 것만 쓴다(클래스, data- 속성, 역할). 글자로 찾지 않는다.
 *
 * 묶음(group)
 *   route    18개 라우트 × 3개 언어 × 9개 폭, 비로그인, 첫 화면과 전체
 *   extra    라우트 표 밖의 주소(없는 주소, 루트 이동)
 *   state    로그인 상태와 프리셋별 화면(390, 1440)
 *   overlay  겹침 화면 전부(390, 1440)
 *   empty    빈 상태
 *   error    그 자리의 오류 한 줄
 *   long     긴 글과 큰 숫자
 *   added    2차 QA 에서 더한 상태(열고 받은 뒤의 지갑 내역, 차감하지 않은 출금 줄, 비밀번호 바꾸기)
 *   loading  하이드레이션 전의 화면(자바스크립트를 끈 채)
 *   hover / focus / active   기본 부품의 상태(1280)
 */
import { LOCALES, WIDTHS } from './lib/common.mjs';

export const BOX_SLUGS = ['gaming-playstation', 'watch-rolex', 'pokemon-charizard'];
export const LEGAL_DOCS = ['terms', 'privacy', 'payments', 'withdrawals', 'refunds', 'policy', 'fairness', 'safety', 'community', 'cookies', 'complaints', 'business', 'faq'];

/** BRIEF 0장의 라우트 18개. box/[slug] 는 박스 셋, legal/[doc] 는 문서 전부로 편다. */
export const ROUTES = [
  { key: 'home', route: '', pattern: '/' },
  { key: 'about', route: '/about', pattern: 'about' },
  { key: 'account', route: '/account', pattern: 'account' },
  ...BOX_SLUGS.map((slug) => ({ key: 'box-' + slug, route: '/box/' + slug, pattern: 'box/[slug]' })),
  { key: 'community', route: '/community', pattern: 'community' },
  { key: 'community-board', route: '/community/board', pattern: 'community/board' },
  { key: 'dev-gallery', route: '/dev/gallery', pattern: 'dev/gallery' },
  { key: 'fairness', route: '/fairness', pattern: 'fairness' },
  { key: 'guide', route: '/guide', pattern: 'guide' },
  { key: 'inventory', route: '/inventory', pattern: 'inventory' },
  { key: 'legal', route: '/legal', pattern: 'legal' },
  ...LEGAL_DOCS.map((doc) => ({ key: 'legal-' + doc, route: '/legal/' + doc, pattern: 'legal/[doc]' })),
  { key: 'profile', route: '/profile', pattern: 'profile' },
  { key: 'reviews', route: '/reviews', pattern: 'reviews' },
  { key: 'verify', route: '/verify', pattern: 'verify' },
  { key: 'wallet', route: '/wallet', pattern: 'wallet' },
  { key: 'wallet-withdraw', route: '/wallet/withdraw', pattern: 'wallet/withdraw' },
  { key: 'wins', route: '/wins', pattern: 'wins' },
];
const routeOf = (key) => { const r = ROUTES.find((x) => x.key === key); if (!r) throw new Error('모르는 라우트: ' + key); return r.route; };

const PAGE = [{ do: 'shot', name: 'first' }, { do: 'shot', name: 'full', full: true }];
const STATE_WIDTHS = [390, 1440];
const PRIMITIVE_WIDTH = 1280;

/** 프리셋별로 볼 화면. 프리셋은 web/scripts/capture/states.mjs 의 것이다. */
const STATE_PAGES = [
  { preset: 'funded', keys: ['home', 'account', 'box-gaming-playstation', 'box-watch-rolex', 'box-pokemon-charizard', 'inventory', 'wallet', 'wallet-withdraw', 'wins', 'verify', 'reviews', 'guide', 'legal'] },
  { preset: 'inventory', keys: ['home', 'account', 'inventory', 'wins', 'verify', 'wallet', 'wallet-withdraw'] },
  { preset: 'shipping', keys: ['inventory', 'account', 'wins'] },
  { preset: 'pending', keys: ['wallet', 'wallet-withdraw', 'account'] },
  { preset: 'zero', keys: ['home', 'wallet', 'box-gaming-playstation', 'wallet-withdraw'] },
  { preset: 'insufficient', keys: ['box-gaming-playstation', 'box-pokemon-charizard', 'wallet'] },
  { preset: 'security', keys: ['account', 'wallet-withdraw'] },
  { preset: 'dailyUsed', keys: ['home'] },
  { preset: 'firstVisit', keys: ['home', 'box-pokemon-charizard'] },
];

const S = {
  login: '.v-header .v-headbtn:not(.v-menu-btn):not([data-balance-open])',
  menu: '.v-menu-btn',
  balance: '[data-balance-open]',
  sheet: '.v-sheet',
  dialog: '[role="dialog"], [role="alertdialog"]',
  search: '.v-search input',
};
const shot = (name, more = {}) => ({ do: 'shot', name, ...more });
const click = (sel, more = {}) => ({ do: 'click', sel, ...more });
const waitFor = (sel, more = {}) => ({ do: 'wait', sel, ...more });
const esc = { do: 'press', key: 'Escape' };

/** 겹침 화면. 주소는 로케일 뒤의 경로. */
const OVERLAYS = [
  { key: 'menu', route: '', preset: 'guest', steps: [click(S.menu, { optional: true }), waitFor(S.sheet), shot('open'), esc, waitFor(S.sheet, { state: 'detached' }), shot('closed')] },
  { key: 'menu-funded', route: '/box/gaming-playstation', preset: 'funded', steps: [click(S.menu, { optional: true }), waitFor(S.sheet), shot('open')] },
  { key: 'login', route: '', preset: 'guest', steps: [click(S.login), waitFor(S.sheet), shot('email'), { do: 'fill', sel: '.v-sheet input', value: 'capture@example.invalid' }, click('.v-sheet button[type="submit"]'), waitFor('.v-sheet input[type="password"]'), shot('password'), click('.v-sheet .v-links .v-link', { nth: 1 }), shot('recover')] },
  { key: 'signup', route: '', preset: 'guest', steps: [click('.v-hero-cta button.v-btn'), waitFor(S.sheet), shot('email'), { do: 'fill', sel: '.v-sheet input', value: 'capture-new@example.invalid' }, click('.v-sheet button[type="submit"]'), waitFor('.v-sheet input[type="password"]'), shot('password')] },
  { key: 'login-from-box', route: '/box/gaming-playstation', preset: 'guest', steps: [click('.v-openbar .v-btn'), waitFor(S.sheet), shot('open')] },
  { key: 'charge', route: '/wallet', preset: 'funded', steps: [click('.v-main .v-btn'), waitFor(S.sheet), { do: 'wait', ms: 1200 }, shot('trc20'), click('.v-sheet .v-chip', { nth: 1 }), { do: 'wait', ms: 1200 }, shot('bep20')] },
  { key: 'charge-from-box', route: '/box/gaming-playstation', preset: 'zero', steps: [click('[data-short-charge]'), waitFor(S.sheet), { do: 'wait', ms: 1200 }, shot('open')] },
  { key: 'balance', route: '', preset: 'funded', steps: [click(S.balance), waitFor(S.sheet), shot('no-held')] },
  { key: 'balance-held', route: '', preset: 'inventory', steps: [click(S.balance), waitFor(S.sheet), shot('held'), click('[data-balance-take]'), waitFor('[data-take-all]'), shot('take')] },
  { key: 'balance-guest-na', route: '/wallet', preset: 'guest', steps: [shot('login-line')] },
  { key: 'take', route: '/inventory', preset: 'inventory', steps: [click('[data-take-batch]'), waitFor('[data-take-all]'), shot('pick-none'), click('[data-take-row]'), shot('pick-one'), click('[data-take-all]'), shot('pick-all'), click('[data-take-submit]'), waitFor('[role="alertdialog"]'), shot('confirm'), esc, waitFor('[data-take-all]'), shot('back-to-pick')] },
  { key: 'take-empty', route: '/inventory', preset: 'funded', steps: [shot('no-take-button')] },
  { key: 'item-box', route: '/box/gaming-playstation', preset: 'guest', steps: [click('.v-item'), waitFor(S.sheet), shot('photo-item'), click('.v-sheet .v-links .v-link'), shot('countries'), esc, waitFor(S.sheet, { state: 'detached' }), click('.v-itemrows .v-itemrow'), waitFor(S.sheet), shot('row-item')] },
  { key: 'item-box-rolex', route: '/box/watch-rolex', preset: 'funded', steps: [click('.v-item'), waitFor(S.sheet), shot('photo-item')] },
  { key: 'item-inventory', route: '/inventory', preset: 'inventory', steps: [click('.v-itemrows .v-itemrow'), waitFor(S.sheet), shot('held'), click('[data-take-primary]'), waitFor('[role="alertdialog"]'), shot('take-confirm'), esc] },
  { key: 'item-shipping', route: '/inventory', preset: 'shipping', steps: [click('.v-chips .v-chip', { nth: 1 }), shot('tab-shipping'), click('.v-itemrows .v-itemrow'), waitFor(S.sheet), shot('requested'), esc, waitFor(S.sheet, { state: 'detached' }), click('.v-itemrows .v-itemrow', { nth: 1 }), waitFor(S.sheet), shot('in-transit')] },
  { key: 'ship', route: '/inventory', preset: 'inventory', steps: [click('.v-itemrows .v-itemrow'), waitFor(S.sheet), click('.v-sheet .v-links .v-link'), waitFor('.v-sheet input'), shot('form'), click('.v-sheet .v-btn'), shot('errors')] },
  { key: 'review-form', route: '/inventory', preset: 'inventory', steps: [click('.v-itemrows .v-itemrow'), waitFor(S.sheet), click('.v-rowlink'), waitFor('.v-sheet textarea'), shot('form'), click('.v-sheet .v-btn'), shot('too-short')] },
  { key: 'review-card', route: '/reviews', preset: 'guest', steps: [click('.v-rvcard-btn, .v-rv-btn'), waitFor(S.sheet), shot('detail')] },
  { key: 'odds', route: '/box/gaming-playstation', preset: 'guest', steps: [{ do: 'open', sel: 'details.v-notes' }, shot('tables', { full: true })] },
  { key: 'odds-pokemon', route: '/box/pokemon-charizard', preset: 'guest', steps: [{ do: 'open', sel: 'details.v-notes' }, shot('tables', { full: true })] },
  { key: 'verify', route: '/verify', preset: 'inventory', steps: [click('.v-itemrows .v-itemrow'), waitFor(S.sheet), waitFor('.v-sheet .v-line', { timeout: 8000, soft: true }), shot('record'), click('.v-sheet .v-links .v-link'), shot('method')] },
  // 비로그인 화면에는 위쪽에 로그인 단추가 있다. 계산 단추는 "값을 직접 넣어 계산" 절 안의 것으로 짚는다
  { key: 'verify-manual', route: '/verify', preset: 'guest', steps: [{ do: 'fill', sel: 'section[aria-labelledby="verify-manual"] .v-field input', nth: 0, value: 'parity-audit-server-seed-0001' }, { do: 'fill', sel: 'section[aria-labelledby="verify-manual"] .v-field input', nth: 2, value: 'parity-audit-client-seed' }, { do: 'fill', sel: 'section[aria-labelledby="verify-manual"] .v-field input', nth: 3, value: '0' }, click('section[aria-labelledby="verify-manual"] .v-btn'), waitFor('section[aria-labelledby="verify-manual"] .v-rows', { timeout: 8000, soft: true }), { do: 'scroll', y: 0 }, shot('computed', { full: true })] },
  { key: 'tx-detail', route: '/wallet', preset: 'pending', steps: [click('.v-itemrows .v-itemrow'), { do: 'wait', ms: 300 }, shot('bonus'), esc, click('.v-itemrows .v-itemrow', { nth: 1 }), { do: 'wait', ms: 300 }, shot('withdraw-pending'), esc, click('.v-itemrows .v-itemrow', { nth: 2 }), { do: 'wait', ms: 300 }, shot('withdraw-hold')] },
  { key: 'account-sheets', route: '/account', preset: 'funded', steps: [click('button.v-row--button', { nth: 0 }), { do: 'wait', ms: 600 }, shot('two-factor'), esc, { do: 'wait', ms: 300 }, click('button.v-row--button', { nth: 1 }), { do: 'wait', ms: 400 }, shot('nickname'), esc, { do: 'wait', ms: 300 }, click('button.v-row--button', { nth: 2 }), { do: 'wait', ms: 400 }, shot('password'), esc, { do: 'wait', ms: 300 }, click('button.v-row--button', { nth: 3 }), { do: 'wait', ms: 400 }, shot('close-account')] },
  { key: 'footer-controls', route: '', preset: 'guest', steps: [{ do: 'scroll', sel: '.v-footer-cols' }, shot('footer'), click('.v-footer-cols button'), { do: 'wait', ms: 300 }, shot('footer-krw'), { do: 'scroll', y: 0 }, shot('home-krw'), shot('home-krw-full', { full: true })] },
  { key: 'currency-box', route: '/box/watch-rolex', preset: 'funded', steps: [{ do: 'scroll', sel: '.v-footer-cols' }, click('.v-footer-cols button'), { do: 'wait', ms: 300 }, { do: 'scroll', y: 0 }, shot('krw'), shot('krw-full', { full: true })] },
  // 개봉 결과와 그 위의 겹침. 고정 시드라 결과가 같다(gaming-playstation, nonce 0 → roll 867322). 움직임 줄이기라 연출 없이 결과가 뜬다.
  { key: 'opening-one', route: '/box/gaming-playstation', preset: 'funded', steps: [click('[data-open-primary]'), waitFor('[role="alertdialog"]'), shot('confirm-large'), click('[role="alertdialog"] .v-btn'), waitFor('.v-op[data-opening-state="settled"]', { timeout: 15000 }), shot('result'), click('.v-op-tool'), waitFor(S.sheet), shot('settings'), esc, waitFor(S.sheet, { state: 'detached' }), click('[data-take-primary]', { optional: true }), waitFor('[role="alertdialog"]'), shot('take-confirm'), esc, waitFor('[role="alertdialog"]', { state: 'detached' }), click('.v-op-actions .v-links .v-link', { nth: 1 }), waitFor(S.sheet), waitFor('.v-sheet .v-line', { timeout: 8000, soft: true }), shot('verify')] },
  { key: 'opening-five', route: '/box/pokemon-charizard', preset: 'zero', patch: 'balance300', steps: [click('.v-openbar .v-chip', { nth: 1 }), shot('qty-5'), click('[data-open-primary]'), waitFor('[role="alertdialog"]'), click('[role="alertdialog"] .v-btn'), waitFor('.v-reveal-result', { timeout: 15000 }), { do: 'wait', ms: 700 }, shot('result'), shot('result-full', { full: true }), click('[data-take-batch]', { optional: true }), waitFor('[data-take-all]'), shot('take-fresh')] },
];

/**
 * 1차에 없던 상태(2차 QA 에서 더함).
 *   wallet-history-open-take  박스를 열고 받은 뒤의 지갑 내역(결과 빌드는 열기와 받기 거래가 내역에 나온다)
 *   zero-withdraw             차감하지 않은 출금 요청의 줄(저장소에 직접 심는다)
 *   password-flow             계정의 비밀번호 바꾸기: 틀린 비밀번호, 틀린 인증 코드, 성공. 인증 앱이 등록된 프리셋(security)을 쓴다.
 *                             비밀번호를 넣으므로 로컬 주소에서만 실행한다(localOnly). '@...' 값은 shots.mjs 가 채운다
 */
const ALERT = '[role="alertdialog"]', ALERT_OK = '[role="alertdialog"] .v-btn';
const PW = (current, code, name) => [
  { do: 'fill', sel: '.v-sheet input', nth: 0, value: current, optional: true }, { do: 'fill', sel: '.v-sheet input', nth: 1, value: 'Changed-only-456789', optional: true }, { do: 'fill', sel: '.v-sheet input', nth: 2, value: code, optional: true },
  click('.v-sheet .v-btn', { optional: true }), { do: 'wait', ms: 3000 }, shot(name),
];
const ADDED = [
  { key: 'wallet-history-open-take', route: '/box/gaming-playstation', preset: 'funded', steps: [click('[data-open-primary]'), waitFor(ALERT), click(ALERT_OK), waitFor('.v-op[data-opening-state="settled"]', { timeout: 15000 }), click('[data-take-primary]'), waitFor(ALERT), click(ALERT_OK), waitFor('[data-taken-title]'), { do: 'goto', route: '/wallet' }, waitFor('.v-main .v-itemrows'), shot('history'), shot('history-full', { full: true }), click('.v-main .v-itemrows .v-itemrow'), { do: 'wait', ms: 300 }, shot('row-0'), esc, { do: 'wait', ms: 300 }, click('.v-main .v-itemrows .v-itemrow', { nth: 1, optional: true }), { do: 'wait', ms: 300 }, shot('row-1')] },
  { key: 'zero-withdraw', route: '/wallet', preset: 'funded', patch: 'zeroWithdraw', steps: [waitFor('.v-main .v-itemrows'), shot('history'), click('.v-main .v-itemrows .v-itemrow'), { do: 'wait', ms: 400 }, shot('row-0'), esc, { do: 'wait', ms: 300 }, click('.v-main .v-itemrows .v-itemrow', { nth: 1 }), { do: 'wait', ms: 400 }, shot('row-1')] },
  { key: 'password-flow', route: '/account', preset: 'security', localOnly: true, steps: [click('button.v-row--button', { nth: 2 }), waitFor('.v-sheet input'), shot('sheet'), ...PW('@wrong-password', '@totp', 'wrong-password'), ...PW('@password', '000000', 'wrong-code'), ...PW('@password', '@totp', 'success')] },
];
/** 하이드레이션 전의 화면(자바스크립트를 끈 채로 연다): 서버가 그린 로딩 상태(자리만 잡은 칸, 눌리지 않는 단추) */
const LOADING_KEYS = ['home', 'box-gaming-playstation', 'inventory', 'wallet', 'wallet-withdraw', 'account', 'verify', 'reviews', 'wins'];

const EMPTY = [
  { key: 'inventory-held', route: '/inventory', preset: 'funded', steps: [shot('held'), click('.v-chips .v-chip', { nth: 1 }), shot('shipping'), click('.v-chips .v-chip', { nth: 2 }), shot('done')] },
  { key: 'wins', route: '/wins', preset: 'funded', steps: [shot('first')] },
  { key: 'verify-records', route: '/verify', preset: 'funded', steps: [shot('first')] },
  { key: 'wallet-history', route: '/wallet', preset: 'zero', patch: 'noHistory', steps: [shot('first')] },
  { key: 'reviews-box', route: '/reviews?box=gaming-playstation', preset: 'guest', steps: [shot('first')] },
  { key: 'search-none', route: '', preset: 'guest', steps: [{ do: 'fill', sel: S.search, value: 'zzzzqqqq' }, { do: 'wait', ms: 300 }, shot('none'), { do: 'fill', sel: S.search, value: '' }, { do: 'wait', ms: 300 }, shot('cleared')] },
];

const ERRORS = [
  { key: 'insufficient', route: '/box/gaming-playstation', preset: 'insufficient', steps: [shot('line'), click('.v-openbar .v-chip', { nth: 2 }), shot('qty-10')] },
  { key: 'insufficient-held', route: '/box/gaming-playstation', preset: 'inventory', patch: 'balanceQuarter', steps: [shot('take-first'), click('[data-short-take]', { optional: true }), waitFor('[data-take-all]'), shot('take-sheet')] },
  { key: 'withdraw-invalid', route: '/wallet/withdraw', preset: 'funded', steps: [shot('gate'), click('.v-main .v-links .v-link'), waitFor('.v-main form input'), shot('form'), { do: 'fill', sel: '.v-main form input', nth: 0, value: 'not-an-address' }, { do: 'fill', sel: '.v-main form input', nth: 1, value: '5' }, click('.v-main form button[type="submit"]'), shot('errors'), { do: 'fill', sel: '.v-main form input', nth: 1, value: '99999999' }, shot('over-balance')] },
  { key: 'withdraw-valid', route: '/wallet/withdraw', preset: 'security', steps: [waitFor('.v-main form input'), shot('form'), { do: 'fill', sel: '.v-main form input', nth: 0, value: 'T' + '1'.repeat(33) }, { do: 'fill', sel: '.v-main form input', nth: 1, value: '100' }, shot('filled'), click('.v-main form button[type="submit"]'), { do: 'wait', ms: 400 }, shot('confirm-stage')] },
  // 브라우저 안의 계정에서는 빈 칸만 잘못된 이메일이다(lib/account.ts 의 validAccountEmail). 빈 채로 누른다
  { key: 'login-invalid', route: '', preset: 'guest', steps: [click(S.login), waitFor(S.sheet), click('.v-sheet button[type="submit"]'), waitFor('.v-sheet .v-line'), shot('error')] },
  { key: 'search-hit', route: '', preset: 'guest', steps: [{ do: 'fill', sel: S.search, value: 'rolex' }, { do: 'wait', ms: 400 }, shot('hits'), shot('hits-full', { full: true })] },
  { key: 'verify-manual-invalid', route: '/verify', preset: 'guest', steps: [click('section[aria-labelledby="verify-manual"] .v-btn'), waitFor('section[aria-labelledby="verify-manual"] .v-line'), { do: 'scroll', sel: 'section[aria-labelledby="verify-manual"] .v-btn' }, shot('input-fail')] },
];

const LONG = [
  { key: 'home', route: '', preset: 'funded', patch: 'big', steps: [shot('first')] },
  { key: 'account', route: '/account', preset: 'funded', patch: 'big', steps: PAGE },
  { key: 'wallet', route: '/wallet', preset: 'funded', patch: 'big', steps: PAGE },
  { key: 'inventory', route: '/inventory', preset: 'inventory', patch: 'big', steps: [...PAGE, click('.v-itemrows .v-itemrow'), waitFor(S.sheet), shot('item')] },
  { key: 'balance', route: '/box/watch-rolex', preset: 'inventory', patch: 'big', steps: [shot('box'), click(S.balance), waitFor(S.sheet), shot('sheet')] },
  { key: 'wallet-krw', route: '/wallet', preset: 'funded', patch: 'bigKrw', steps: PAGE },
  { key: 'box-krw', route: '/box/watch-rolex', preset: 'inventory', patch: 'bigKrw', steps: PAGE },
  { key: 'inventory-krw', route: '/inventory', preset: 'inventory', patch: 'bigKrw', steps: PAGE },
];

/** 기본 부품의 hover, focus-visible, active. 요소 둘레만 찍는다. */
const PRIMITIVES = [
  { key: 'btn', route: '', preset: 'guest', sel: '.v-hero-cta .v-btn' },
  { key: 'btn-quiet', route: '', preset: 'guest', sel: '.v-main .v-btn--quiet' },
  { key: 'chip', route: '', preset: 'guest', sel: '.v-chips .v-chip', nth: 1 },
  { key: 'chip-pressed', route: '', preset: 'guest', sel: '.v-chips .v-chip', nth: 0 },
  { key: 'boxcard', route: '', preset: 'guest', sel: '.v-boxcard', nth: 0 },
  { key: 'headbtn', route: '', preset: 'guest', sel: S.login },
  { key: 'headbtn-balance', route: '', preset: 'funded', sel: S.balance },
  { key: 'nav-link', route: '', preset: 'guest', sel: '.v-nav a', nth: 1 },
  { key: 'logo', route: '', preset: 'guest', sel: '.v-logo' },
  { key: 'search', route: '', preset: 'guest', sel: S.search },
  { key: 'footer-link', route: '', preset: 'guest', sel: '.v-footer-cols a', nth: 0 },
  { key: 'footer-button', route: '', preset: 'guest', sel: '.v-footer-cols button' },
  { key: 'back', route: '/box/gaming-playstation', preset: 'guest', sel: '.v-back' },
  { key: 'mainitem', route: '/box/gaming-playstation', preset: 'guest', sel: '.v-mainitem' },
  { key: 'item', route: '/box/gaming-playstation', preset: 'guest', sel: '.v-item', nth: 0 },
  { key: 'itemrow', route: '/box/gaming-playstation', preset: 'guest', sel: '.v-itemrows .v-itemrow', nth: 0 },
  { key: 'link', route: '/box/gaming-playstation', preset: 'guest', sel: '.v-main .v-link', nth: 0 },
  { key: 'summary', route: '/box/gaming-playstation', preset: 'guest', sel: 'details.v-notes summary', nth: 0 },
  { key: 'open-primary', route: '/box/gaming-playstation', preset: 'funded', sel: '[data-open-primary]' },
  { key: 'row-link', route: '/account', preset: 'funded', sel: 'a.v-row--link', nth: 0 },
  { key: 'row-button', route: '/account', preset: 'funded', sel: 'button.v-row--button', nth: 0 },
  { key: 'rvcard', route: '/reviews', preset: 'guest', sel: '.v-rvcard-btn, .v-rv-btn', nth: 0 },
  { key: 'legal-row', route: '/legal', preset: 'guest', sel: '.v-main a', nth: 0 },
];

/**
 * 프리셋 위에 덧입히는 값. shots.mjs 가 이름으로 찾아 쓴다(lib/patches.mjs).
 *   balance300      잔액 300 (5개 열기에 쓴다)
 *   balanceQuarter  잔액 0.25 (보관 상품은 그대로)
 *   noHistory       거래 내역 없음
 *   big             큰 잔액, 긴 닉네임, 큰 금액의 거래
 *   bigKrw          big 에 표시 통화를 원화로
 */
export const PATCH_NAMES = ['balance300', 'balanceQuarter', 'noHistory', 'big', 'bigKrw'];

const idOf = (group, key, locale, width, preset, patch) => `${group}/${key}/${locale}-${width}-${preset}${patch ? '+' + patch : ''}`;

export function buildPlan() {
  const items = [];
  const add = (group, key, route, locale, width, preset, steps, more = {}) =>
    items.push({ id: idOf(group, key, locale, width, preset, more.patch), group, routeKey: key, route, locale, width, preset, steps, ...more });

  for (const r of ROUTES) for (const locale of LOCALES) for (const width of WIDTHS) add('route', r.key, r.route, locale, width, 'guest', PAGE, { pattern: r.pattern });
  for (const locale of LOCALES) for (const width of STATE_WIDTHS) {
    add('extra', 'not-found', '/no-such-page', locale, width, 'guest', PAGE, { allowHttpError: true });
    add('extra', 'not-found-box', '/box/no-such-box', locale, width, 'guest', PAGE, { allowHttpError: true });
    add('extra', 'root', '', locale, width, 'guest', [{ do: 'shot', name: 'first' }], { root: true });
  }
  for (const { preset, keys } of STATE_PAGES) for (const key of keys) for (const locale of LOCALES) for (const width of STATE_WIDTHS) add('state', key, routeOf(key), locale, width, preset, PAGE);
  const groups = [['overlay', OVERLAYS], ['empty', EMPTY], ['error', ERRORS], ['long', LONG], ['added', ADDED]];
  for (const [group, list] of groups) for (const o of list) for (const locale of LOCALES) for (const width of STATE_WIDTHS) add(group, o.key, o.route, locale, width, o.preset, o.steps, { ...(o.patch ? { patch: o.patch } : {}), ...(o.localOnly ? { localOnly: true } : {}) });
  for (const key of LOADING_KEYS) for (const locale of LOCALES) for (const width of STATE_WIDTHS) add('loading', key, routeOf(key), locale, width, 'funded', PAGE, { noJs: true });
  for (const p of PRIMITIVES) for (const locale of LOCALES) {
    const target = { sel: p.sel, nth: p.nth ?? 0 };
    const clip = { clip: p.sel, clipNth: p.nth ?? 0, pad: 16 };
    add('hover', p.key, p.route, locale, PRIMITIVE_WIDTH, p.preset, [{ do: 'scroll', ...target }, shot('rest', clip), { do: 'hover', ...target }, shot('hover', clip)]);
    add('focus', p.key, p.route, locale, PRIMITIVE_WIDTH, p.preset, [{ do: 'scroll', ...target }, { do: 'focus', ...target }, shot('focus', clip)]);
    add('active', p.key, p.route, locale, PRIMITIVE_WIDTH, p.preset, [{ do: 'scroll', ...target }, { do: 'hold', ...target }, shot('active', clip), { do: 'release' }]);
  }
  const seen = new Set();
  for (const item of items) { if (seen.has(item.id)) throw new Error('겹치는 항목: ' + item.id); seen.add(item.id); }
  return items;
}

/** 항목이 만들 촬영 이름 전부(선택 단계가 빠져도 "찍혀야 하는 것"의 목록으로 쓴다). */
export const shotsOf = (item) => item.steps.filter((s) => s.do === 'shot').map((s) => `${item.id}__${s.name}`);

if (process.argv[1] && process.argv[1].endsWith('plan.mjs')) {
  const plan = buildPlan();
  const by = {};
  for (const item of plan) { by[item.group] ??= { items: 0, shots: 0 }; by[item.group].items++; by[item.group].shots += shotsOf(item).length; }
  console.log(JSON.stringify({ items: plan.length, shots: plan.reduce((n, i) => n + shotsOf(i).length, 0), by }, null, 1));
}
