import path from "node:path";
import { pathToFileURL } from "node:url";

const mem = new Map<string, string>();
const storage = {
  getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
  setItem: (k: string, v: string) => { mem.set(k, String(v)); },
  removeItem: (k: string) => { mem.delete(k); },
  clear: () => mem.clear(),
  key: (i: number) => [...mem.keys()][i] ?? null,
  get length() { return mem.size; },
};
(globalThis as any).localStorage = storage;
(globalThis as any).window = globalThis;

const ba = await import(pathToFileURL(path.join(process.cwd(), "lib/browserAccount.ts")).href);
const attempt = async (p: string, body: unknown) => {
  try { const r = await ba.browserAccountRequest(p, body); return { ok: true, r: JSON.stringify(r) }; }
  catch (e: any) { return { ok: false, name: e?.constructor?.name, code: e?.code, reason: e?.reason ?? null }; }
};
const login = await attempt("/auth/login", { email: "audit@example.test", password: "pw-audit-0001" });
const id = login.ok ? JSON.parse(login.r!).user.id : null;
console.log(JSON.stringify({
  login: login.ok,
  loginWithOtherPassword: (await attempt("/auth/login", { email: "audit@example.test", password: "x" })).ok,
  passwordChange: await attempt("/account/password/change", { currentPassword: "pw-audit-0001", newPassword: "new-password-0002", otpCode: "123456", accountId: id }),
  closure: await attempt("/account/closure", { password: "pw-audit-0001", confirm: true }),
  shipping: await attempt("/shipping/request", { ownedIds: ["o1"], address: {}, feeUsdt: 0, idempotencyKey: "k" }),
  depositAddress: await attempt("/deposit/address", { network: "TRC20", userKey: id }),
}, null, 1));
