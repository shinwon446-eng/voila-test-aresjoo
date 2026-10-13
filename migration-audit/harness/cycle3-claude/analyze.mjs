#!/usr/bin/env node
/**
 * both() 가 남긴 기록(out/<이름>.json)의 다른 칸을 갈래로 나눠 센다. 갈래에 들지 않는 칸만 전부 찍는다.
 *   node analyze.mjs <파일 이름의 앞머리> [--wallet-steps 정규식]
 * 갈래
 *   noise-id     실행마다 달라지는 번호(출금 접수 번호, 이메일 코드)
 *   E-14         기준 쪽의 "$-" 를 "-$" 로 바꾸면 결과 쪽과 같은 글
 *   E-01-field   출금 거래의 debited 칸(결과에만 true)
 *   E-06         지갑 화면에서 내역의 줄이 늘어서 달라진 칸(지갑 화면의 단계에서만)
 *   other        그 밖의 전부
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { OUT } from './c3.mjs';

const prefix = process.argv[2] ?? 'money-';
const signFix = (text) => String(text).replace(/([$₩])-(?=\d)/g, '-$1');
const WALLET_STEP = /지갑 내역|내역 |통화|새로 고침|행 열기|출금 취소|취소하지 않기|취소된/;
const classify = (d, stepName, pagePath) => {
  if (/withdrawals\.browser_withdraw_|\.serverId$|challenge\.(code|id)$|proofs/.test(d.path)) return 'noise-id';
  if (/\.debited$/.test(d.path) && d.orig === undefined && d.result === true) return 'E-01-field';
  if (typeof d.orig === 'string' && typeof d.result === 'string' && signFix(d.orig) === d.result) return 'E-14';
  if (/mainOutsideReviews/.test(d.path) && /\/wallet\//.test(pagePath ?? '')) return 'E-06/E-14(본문 해시)';
  if (/\/wallet\/$/.test(pagePath ?? '') && /^observed\.(itemrows|counts\.itemrows|rows\[1\]|dialogs|links|focus)/.test(d.path)) return 'E-06';
  return 'other';
};
const files = (await readdir(OUT)).filter((f) => f.startsWith(prefix) && f.endsWith('.json')).sort();
for (const file of files) {
  const data = JSON.parse(await readFile(path.join(OUT, file), 'utf8'));
  const tally = {}; const others = [];
  data.steps.forEach((s, i) => {
    if (s.onlyOne) { others.push(`[한쪽만 ${s.onlyOne}] ${s.name}`); return; }
    const pagePath = data.raw.result.steps[i]?.observed?.path;
    for (const d of s.diffs) { const kind = classify(d, s.name, pagePath); tally[kind] = (tally[kind] ?? 0) + 1; if (kind === 'other') others.push(`${s.name} :: ${d.path}: ${JSON.stringify(d.orig)?.slice(0, 200)} => ${JSON.stringify(d.result)?.slice(0, 200)}`); }
  });
  const errors = data.steps.filter((s) => s.error).map((s) => `${s.name}: ${s.error}`);
  console.log(`${file}: 단계 ${data.steps.length}, 다른 칸 ${JSON.stringify(tally)}${data.runError.orig || data.runError.result ? ' 멈춤 ' + JSON.stringify(data.runError) : ''}${errors.length ? ' 단계 오류 ' + JSON.stringify(errors) : ''}`);
  for (const o of others) console.log('    OTHER ' + o);
}
