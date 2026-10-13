#!/usr/bin/env bash
# 통합 담당의 재실행. 분석가 B 의 스크립트 사본을 배포 사이트에 다시 돌린다.
# 계정을 만들거나 비밀번호를 넣는 시나리오(03-auth 전부, 09:k1, 09b:e1, 10:m4)와
# 출금 화면을 거치는 시나리오(06:w3, 06:w4)와 배송 시트에 값을 넣는 05:t2 는 돌리지 않는다. 개발 서버용 11 도 돌리지 않는다.
# 결과는 이 폴더의 results/ 에, 화면은 screenshots/before/consolidator-rerun/ 에 따로 적힌다.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE/../../../web" || exit 1
LOG="$HERE/run-all.log"
: > "$LOG"
run() {
  echo "=== $* ===" >> "$LOG"
  node "../migration-audit/harness/consolidator-rerun/$1" "${@:2}" >> "$LOG" 2>&1
  echo "exit=$?" >> "$LOG"
}
run 00-probe.mjs
run 04-open.mjs
run 09-keys-dblclick.mjs --only k2,k3
run 09b-debug.mjs --only e2,e3
run 01-nav.mjs
run 01b-nav-debug.mjs
run 02-box.mjs
run 05-take.mjs --only t1,t3,t4,t5,t6
run 06-wallet.mjs --only w1,w2
run 07-verify-wins.mjs
run 10-misc.mjs --only m1,m2,m3
run 12-extra.mjs
echo "ALL DONE" >> "$LOG"
