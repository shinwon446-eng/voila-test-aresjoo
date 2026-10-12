#!/bin/bash
# img-plan.mjs 가 짠 차례(qa/codex/pool-<이름표>-plan.txt)대로 생성 풀 하나를 돌린다. 저장소 루트에서 실행.
#   (cd web && node scripts/catalog2/img-plan.mjs q 30,60,1000 fashion mobile ...) && bash web/scripts/catalog2/img-pool2.sh q 32
# plan 의 줄마다(카테고리와 깊이 하나) 묶음이 CHUNK(기본 20)개 끝날 때마다 변환, 커밋, 배포(voila-redesign:main)한다.
# WAIT_LOG 에 다른 풀의 로그를 주면 거기에 "전부 끝"이 적힐 때까지 변환을 시작하지 않는다(두 풀이 사진 목록 파일을 같이 쓰지 않게).
# 못 만든 것은 qa/codex/pool-<이름표>-missing.log, 생성 풀의 진행은 qa/codex/pool-<이름표>-run.log.
# Codex 한도에 걸리면(로그에 usage limit 이나 그림 도구의 usage_limit_reached) 남은 묶음을 버리고, 이미 나온 원본만 변환한 뒤 끝낸다.
label="$1"; max="${2:-24}"
chunk="${CHUNK:-20}"
plan="qa/codex/pool-$label-plan.txt"; runlog="qa/codex/pool-$label-run.log"; misslog="qa/codex/pool-$label-missing.log"
[ -s "$plan" ] || { echo "plan 이 없다: $plan"; exit 1; }
name_of() {
  case "$1" in
    car) echo "자동차";; watch) echo "시계";; bag) echo "가방";; jewelry) echo "주얼리";; fashion) echo "패션";;
    mobile) echo "모바일";; computer) echo "컴퓨터";; gaming) echo "게임";; audio) echo "오디오";; camera) echo "카메라";;
    home) echo "가전";; pokemon) echo "포켓몬";; toy) echo "장난감";; outdoor) echo "아웃도어";; sport) echo "스포츠";; beauty) echo "뷰티";;
    *) echo "$1";;
  esac
}
all=$(cut -d' ' -f2- "$plan" | tr '\n' ' ')
echo "$(date +%H:%M) 묶음 $(echo $all | wc -w)개, 동시 $max"
: > "$misslog"
bash web/scripts/images/gen-run.sh "$max" $all > "$runlog" 2>&1 &
runner=$!
limited=0
# 한도에 걸렸는지: 끝난 묶음의 로그에 usage limit 이 있으면 생성 풀을 끝내고 남은 묶음을 끝난 것으로 적는다
check_limit() {
  [ "$limited" -eq 1 ] && return
  local t hit=0
  for t in $(tail -6 "$runlog" | awk '/ done /{print $3}'); do grep -q -E "hit your usage limit|usage_limit_reached" "qa/codex/gen-log-$t.txt" 2>/dev/null && hit=$((hit + 1)); done
  if [ "$hit" -ge 4 ]; then
    limited=1
    MSYS_NO_PATHCONV=1 taskkill /PID "$(cat /proc/$runner/winpid 2>/dev/null)" /T /F > /dev/null 2>&1; kill "$runner" 2>/dev/null
    for t in $all; do grep -q "done $t exit" "$runlog" || echo "$(date +%H:%M) done $t exit 99 (한도로 멈춤)" >> "$runlog"; done
    echo "$(date +%H:%M) Codex 한도에 걸림: 남은 묶음을 버리고 나온 원본만 변환한다"
  fi
}
if [ -n "$WAIT_LOG" ]; then
  until grep -q "전부 끝" "$WAIT_LOG"; do sleep 20; check_limit; done
  echo "$(date +%H:%M) 앞선 풀이 끝남"
fi
while read -r key rest <&3; do
  cat="${key%%:*}"; depth="${key#*:}"
  tags=($rest); n=${#tags[@]}
  parts=$(( (n + chunk - 1) / chunk ))
  for ((i = 0; i < n; i += chunk)); do
    part=("${tags[@]:i:chunk}")
    for t in "${part[@]}"; do
      until grep -q "done $t exit" "$runlog"; do sleep 15; check_limit; done
      # Codex 가 결과 글 없이 끝난 묶음도 만들어 둔 원본은 변환한다
      [ -s "qa/codex/gen-out-$t.md" ] || echo "(결과 글 없이 끝남)" > "qa/codex/gen-out-$t.md"
    done
    bash web/scripts/images/gen-review.sh qa/catalog2/sheets "${part[@]}" 2>&1 | grep -E "원본 없음|failed$|empty$" > "qa/codex/pool-$label-part.log"
    miss=$(grep -c "원본 없음" "qa/codex/pool-$label-part.log"); cat "qa/codex/pool-$label-part.log" >> "$misslog"
    new=$(git status --short web/public/assets/photography | wc -l)
    if [ "$new" -gt 0 ]; then
      git add web/public/assets/photography web/scripts/images/generated.json web/scripts/images/studio.json 2>/dev/null
      git -c user.name=aresjoo -c user.email=blackethereum7@gmail.com commit -q -m "새 카탈로그 사진: $(name_of "$cat") 박스마다 ${depth}개까지 $((i / chunk + 1))/$parts, ${new}장

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
      git push -q origin voila-redesign:main 2>&1 | tail -1
    fi
    echo "$(date +%H:%M) $cat 깊이 $depth $((i / chunk + 1))/$parts: 사진 ${new}장, 원본 없음 ${miss}"
    check_limit
  done
done 3< "$plan"
wait
echo "$(date +%H:%M) 전부 끝"
