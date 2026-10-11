#!/bin/bash
# 새 카탈로그의 사진을 한 번에: 묶음 만들기 → Codex 생성(동시 8) → 등록과 같은 톤 변환 → 검수 시트. 저장소 루트에서 실행.
#   bash web/scripts/catalog2/img-drive.sh <단계> <이름표> <카테고리:규칙 파일 또는 -> ...
#   예: bash web/scripts/catalog2/img-drive.sh 2 o2 watch:qa/codex/gen-rules-watch.md bag:- audio:qa/codex/gen-rules-gear.md
# 단계는 scripts/catalog2/img-list.ts 의 것(박스마다 얼굴 순서로 몇 개까지). 이름표는 묶음 이름에 들어가 다른 회차와 겹치지 않게 한다.
# 앞서 돌던 생성이 있으면 끝나기를 기다린다(WAIT_FOR 에 기다릴 gen-out 파일들을 빈칸으로 구분해 준다. 40분까지).
stage="$1"; label="$2"; shift 2
if [ -n "$WAIT_FOR" ]; then
  for i in $(seq 1 240); do
    missing=0; for f in $WAIT_FOR; do [ -s "$f" ] || missing=$((missing + 1)); done
    [ "$missing" -eq 0 ] && break
    sleep 10
  done
  echo "$(date +%H:%M) 앞선 생성 대기 끝 (남은 것 $missing)"
fi
tags=""
for pair in "$@"; do
  cat="${pair%%:*}"; rules="${pair#*:}"
  line=$(cd web && node scripts/catalog2/img-batch.mjs "$cat" "$stage" "$rules" 22 "$label" 2>/dev/null | tail -1)
  case "$line" in v2-*) tags="$tags $line";; *) echo "$cat: 묶음 없음";; esac
done
echo "$(date +%H:%M) 묶음:$tags"
[ -z "$tags" ] && { echo "만들 것이 없다"; exit 0; }
bash web/scripts/images/gen-run.sh 8 $tags | tail -3
echo "$(date +%H:%M) 변환 시작"
bash web/scripts/images/gen-review.sh qa/catalog2/sheets $tags 2>&1 | grep -v "^$" | tail -80
echo "$(date +%H:%M) 끝"
