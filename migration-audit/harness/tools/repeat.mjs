#!/usr/bin/env node
/**
 * 같은 환경에서 같은 항목을 여러 번 찍어 그림이 몇 가지로 나오는지 센다(도구 자체의 흔들림을 재는 보조 도구).
 *   node tools/repeat.mjs <baseUrl> <작업 폴더> <횟수> <shots.mjs 에 넘길 나머지 인자...>
 *   예) node tools/repeat.mjs http://127.0.0.1:4173/voila-test-aresjoo C:/tmp/rep 5 --only error/search-hit --quiet 700
 * 촬영마다 서로 다른 그림(파일 해시)의 수를 적는다. 전부 1 이면 그 조건에서 흔들림이 없었다는 뜻이다.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [baseUrl, workDir, timesArg, ...rest] = process.argv.slice(2);
if (!baseUrl || !workDir || !timesArg) { console.error('사용법: node tools/repeat.mjs <baseUrl> <작업 폴더> <횟수> <shots.mjs 인자...>'); process.exit(2); }
const shots = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'shots.mjs');
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith('.png') ? [path.join(dir, e.name)] : []));
const seen = new Map();
for (let i = 1; i <= Number(timesArg); i++) {
  const dir = path.join(path.resolve(workDir), 'run-' + i);
  rmSync(dir, { recursive: true, force: true });
  execFileSync(process.execPath, [shots, 'repeat-' + i, baseUrl, dir, ...rest], { stdio: 'ignore' });
  for (const file of walk(dir)) {
    const id = path.relative(dir, file).replace(/\\/g, '/');
    const hash = createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 12);
    if (!seen.has(id)) seen.set(id, new Map());
    seen.get(id).set(hash, (seen.get(id).get(hash) ?? 0) + 1);
  }
}
let unstable = 0;
for (const [id, hashes] of Array.from(seen).sort()) if (hashes.size > 1) { unstable++; console.log(`${hashes.size}가지  ${id}  ${Array.from(hashes.values()).join('+')}`); }
console.log(`촬영 ${seen.size}종, ${timesArg}번씩. 그림이 둘 이상으로 나온 촬영 ${unstable}종.`);
