import { readFile } from 'node:fs/promises';
import { createHash, pbkdf2Sync } from 'node:crypto';

// 앱 모듈이나 실제 계정 저장소를 실행하거나 읽지 않는다. 새 Chrome 컨텍스트 전용 자료다.
export const presets = {
  guest: '비로그인', zero: '로그인, 잔액 0', insufficient: '로그인, 잔액 0.25',
  funded: '로그인, 잔액 10000', inventory: '보관 상품 두 개', shipping: '배송 요청과 운송 중 상품',
  pending: '출금 대기와 72시간 보류', security: '2단계 인증 등록 계정',
  dailyUsed: '일일 상자 사용 완료', firstVisit: '첫 방문, 로그인하면 앱의 첫 로그인 보너스 지급',
};
export const unavailable = [
  '실제 외부 OAuth, 인증 메일 수신함, 실입금과 실출금, 실제 운송장 발급: 외부 서비스는 호출하지 않습니다.',
  '브라우저 모드 입금 주소와 입금 완료: 주소가 환경 설정에 의존하며 로컬 어댑터는 page.route를 통과하지 않습니다. 환경 설정을 읽거나 바꾸지 않습니다.',
  '배송 접수 완료: 개봉 결과의 requestEnabled가 false이며 browserAccount.ts에는 /shipping/request 처리기도 없습니다. 보관함에서 입력과 제출 오류까지 촬영합니다.',
  '미연결 컴포넌트, 승급 반전, 니어미스, 데모 개봉, AML 차단 토스트: 현행 사용자 진입 경로가 없습니다.',
  '전용 오프라인, 세션 만료, 전역 오류 디자인: 현행 구현이 없습니다. 기본 화면과 요청별 오류만 관찰할 수 있습니다.',
  '브라우저 탭 UI, OS 파일 선택창, 네이티브 select 펼친 팝업: headless 페이지 스크린샷 범위 밖입니다.',
];
const userId = 'capture-account';
const password = 'CaptureOnly123!';
export const credentials = { email: 'capture@example.invalid', password };
const wrap = (state, version = 0) => JSON.stringify({ state, version });

export async function makeState(name, locale) {
  if (!presets[name]) throw new Error(`만들지 못함: 알 수 없는 프리셋 ${name}`);
  const source = await readFile(new URL('../../lib/labSite.ts', import.meta.url), 'utf8');
  const prefix = source.match(/LAB_STORAGE_PREFIX\s*=\s*"([^"]+)"/)?.[1];
  if (!prefix) throw new Error('만들지 못함: 사이트 저장소 접두사를 찾지 못했습니다.');
  const now = new Date().toISOString();
  const loggedIn = !['guest', 'firstVisit'].includes(name);
  const balance = name === 'zero' ? 0 : name === 'insufficient' ? 0.25 : loggedIn ? 10000 : 0;
  const user = { id: userId, email: credentials.email, nickname: '촬영계정', provider: 'email', createdAt: now,
    emailVerified: true, local: true, sessionVersion: 0, passwordFailures: 0, twoFactorEnabled: name === 'security' };
  const account = { user, salt: 'capture-only-salt', passwordHash: '', proofs: [], withdrawals: {},
    ...(name === 'security' ? { secret: 'JBSWY3DPEHPK3PXP', enabledAt: now } : {}) };
  // browserAccount.ts와 같은 PBKDF2 계약. 테스트 전용 비밀번호다.
  account.passwordHash = pbkdf2Sync(password, account.salt, 210000, 32, 'sha256').toString('hex');
  const transactions = name === 'firstVisit' ? [] : [{ id: 'capture-welcome', accountId: userId, type: 'bonus', amountUsdt: 10000, ref: 'welcome', at: now }];
  if (name === 'pending') for (const [i, status] of ['PENDING', 'PENDING_72H_HOLD'].entries()) {
    const id = `capture-withdraw-${i}`;
    const unlockAt = Date.now() + 72 * 3600000;
    account.withdrawals[id] = { id, requestId: id, status, ...(i ? { unlockAt } : {}) };
    transactions.push({ id, serverId: id, accountId: userId, type: 'withdraw', amountUsdt: -50, feeUsdt: 1, netUsdt: 49,
      at: now, status, network: 'TRC20', address: 'T' + '1'.repeat(33), authMethod: i ? 'EMAIL_72H_HOLD' : '2FA_OTP', ...(i ? { unlockAt } : {}) });
  }
  const wallet = { balance, cryptoBalance: balance, cardBalance: 0, transactions: loggedIn ? transactions : [], settledDepositRefs: [],
    totalDeposited: 0, totalDepositedCrypto: 0, totalDepositedCard: 0, totalWagered: 0, welcomeClaimed: loggedIn };
  // 실제 상품 ID와 가격. 의도적으로 옛 기록을 사용하므로 검증 화면은 부분 검증 또는 불일치다.
  const fair = { serverSeed: 'capture-fixture', serverSeedHash: createHash('sha256').update('capture-fixture').digest('hex'), clientSeed: 'capture-client', nonce: 0, roll: 0 };
  const items = ['inventory', 'shipping'].includes(name) ? [
    { id: 'capture-item-1', itemId: 'da-iphone16', valueUsdt: 1000 },
    { id: 'capture-item-2', itemId: 'aud-airpods', valueUsdt: 549 },
  ].map((item, i) => ({ ...item, boxSlug: 'dollar-apple', tier: 'royal', acquiredAt: now, fair,
    fundingSource: 'crypto', fundingRatio: { crypto: 1, card: 0 }, status: name === 'shipping' ? i ? 'SHIPPING' : 'SHIPPING_REQUESTED' : 'IN_STORAGE',
    ...(name === 'shipping' ? { shipping: { address: { recipient: '촬영 수령인', country: 'SG', phone: '+6500000000', postalCode: '000000', address: 'Capture fixture address' }, feeUsdt: 0, requestedAt: now, requestId: `capture-shipping-${i}`, feeFundingRatio: { crypto: 1, card: 0 }, ...(i ? { carrier: 'DHL', trackingNumber: 'CAPTURE-ONLY', shippedAt: now } : {}) } } : {}) })) : [];
  const values = {
    'gachaflix.locale': locale, 'gachaflix.currency': wrap({ currency: 'USDT' }), 'gachaflix.settings': wrap({ muted: true }),
    'voila-auth-v1': wrap({ user: null }), 'voila.browser-accounts.v1': JSON.stringify(name === 'firstVisit' ? [] : [account]),
    'gachaflix.wallet': wrap(wallet, 4), 'gachaflix.inventory': wrap({ items }),
    [`voila.browser-wallet.${userId}`]: wrap(wallet, 4), [`voila.browser-inventory.${userId}`]: wrap({ items }),
    'voila.browser-wallet.guest': wrap({ ...wallet, balance: 0, cryptoBalance: 0, transactions: [] }, 4),
    'voila.browser-inventory.guest': wrap({ items: [] }), 'gachaflix.community': wrap({ mine: [] }),
    'gachaflix.daily': wrap({ lastOpenedAt: name === 'dailyUsed' ? now : null, history: [] }),
    'gachaflix.telemetry': wrap({ spinTimes: [] }),
  };
  if (loggedIn) values['voila.browser-session.v1'] = userId;
  return { prefix, values, user, loggedIn, name, account };
}

export async function installState(context, state, origin) {
  await context.addInitScript(({ prefix, values, origin }) => {
    if (location.origin !== origin) return;
    const marker = prefix + 'capture-initialized';
    // 탐색마다 프리셋을 되감지 않는다. 로그인과 구매 결과가 다음 페이지까지 유지된다.
    if (sessionStorage.getItem(marker)) return;
    const shimmed = Boolean(Storage.prototype.__voilaLab);
    for (const [key, value] of Object.entries(values)) localStorage.setItem(shimmed ? key : prefix + key, value);
    sessionStorage.setItem(marker, '1');
  }, { prefix: state.prefix, values: state.values, origin });
}

export async function installRoutes(context, page, state, origin, events) {
  let loggedIn = state.loggedIn;
  const handler = async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    // 허용하는 것은 이 로컬 앱의 문서와 정적 자원뿐이다. API GET도 통과시키지 않는다.
    const staticPath = /^\/(?:_next\/(?:static\/|image)|assets\/|audio\/|favicon\.ico$|icon\.svg$)/.test(path);
    const documentPath = path === '/' || /^\/(ko|en|zh)(\/|$)/.test(path);
    if (url.origin === origin && method === 'GET' && (staticPath || (documentPath && ['document', 'fetch'].includes(request.resourceType())))) return route.continue();
    let body = {};
    try { body = request.postDataJSON() ?? {}; } catch { /* 요청 형식 오류도 실제 서버에 보내지 않는다. */ }
    let status = 200, data;
    if (path.endsWith('/auth/csrf')) data = { token: 'capture-only-csrf-token-0000' };
    else if (path.endsWith('/auth/session')) { status = loggedIn ? 200 : 401; data = loggedIn ? { user: state.user } : { code: 'credentials' }; }
    else if (/\/auth\/(login|email\/verify)$/.test(path)) { loggedIn = true; data = { user: state.user }; }
    else if (path.endsWith('/auth/signup')) data = { verificationRequired: true };
    else if (path.endsWith('/auth/logout')) { loggedIn = false; data = { loggedOut: true }; }
    else if (path.endsWith('/account/security')) data = { twoFactorEnabled: state.name === 'security', enabledAt: state.name === 'security' ? state.user.createdAt : null };
    else if (path.endsWith('/account/password/status')) data = { accountId: state.user.id, provider: 'email', failures: 0, locked: false, twoFactorEnabled: state.name === 'security' };
    else if (path.endsWith('/deposit/address')) { status = 503; data = { code: 'capture_address_unavailable' }; }
    else if (path.endsWith('/deposit/check')) data = { status: 'pending', confirmations: 0 };
    else if (/\/withdraw\/capture-withdraw-[01]$/.test(path)) data = state.account.withdrawals[path.split('/').at(-1)];
    else if (path.endsWith('/feed/live')) data = [];
    else if (path.endsWith('/feed/proof')) data = { payouts: [], shipments: [] };
    else if (/\/shipping\//.test(path) && method === 'GET') { status = 404; data = {}; }
    else { status = 503; data = { code: 'capture_unmocked', message: '촬영 도구에서 차단한 요청' }; }
    events.push({ method, url: url.origin + path, status, mocked: true, unsupported: status === 503 });
    await route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': origin, 'access-control-allow-credentials': 'true' }, body: JSON.stringify(data ?? {}) });
  };
  // page.route가 실제 페이지 요청을 처리하고 context.route는 팝업의 첫 요청까지 보호한다.
  await context.route('**/*', handler);
  await page.route('**/*', handler);
  await context.routeWebSocket('**/*', socket => { events.push({ url: socket.url(), blocked: 'websocket' }); socket.close(); });
}
