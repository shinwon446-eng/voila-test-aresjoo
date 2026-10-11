#!/bin/bash
# Codex 이미지 생성 묶음을 여러 개 동시에 돌린다. 저장소 루트에서 실행.
#   bash web/scripts/images/gen-run.sh <동시 개수> <태그> <태그> ...
# 태그마다 qa/codex/gen-input-<태그>.md 를 넣고 qa/codex/gen-out-<태그>.md 를 받는다.
# rtk codex 는 시작할 때마다 CLI 를 갱신하므로 시작을 20초씩 띄운다(동시 설치 충돌 방지).
max="$1"; shift
ref="qa/cycles/c11/gen-pilot.png"
running=0
for tag in "$@"; do
  if [ "$running" -ge "$max" ]; then wait -n; running=$((running - 1)); fi
  (
    cat "qa/codex/gen-input-$tag.md" | rtk codex --dangerously-bypass-approvals-and-sandbox exec -m gpt-6-astra -c model_reasoning_effort=high --skip-git-repo-check --ephemeral -i "$ref" -o "qa/codex/gen-out-$tag.md" - > "qa/codex/gen-log-$tag.txt" 2>&1
    echo "$(date +%H:%M) done $tag exit $?"
  ) &
  running=$((running + 1))
  sleep 20
done
wait
echo "all done"
