#!/bin/bash
# 여러 카테고리의 사진을 생성 풀 하나로 돌린다(img-groups.sh 는 무리마다 동시 여덟이라 카테고리가 많으면 느리다). 저장소 루트에서 실행.
#   bash web/scripts/catalog2/img-pool.sh <단계> <이름표> <동시 개수> <카테고리> ...
#   예: bash web/scripts/catalog2/img-pool.sh 4 p4 24 watch car bag
# 묶음을 전부 만들어 한 풀에서 생성하고, 카테고리의 묶음이 CHUNK(기본 20)개 끝날 때마다 변환, 커밋, 배포(voila-redesign:main)까지 한다.
# 끝내 원본이 안 나온 상품은 qa/codex/pool-<이름표>-missing.log 에 쌓인다. 생성 풀의 진행은 qa/codex/pool-<이름표>-run.log.
stage="$1"; label="$2"; max="$3"; shift 3
chunk="${CHUNK:-20}"
runlog="qa/codex/pool-$label-run.log"; misslog="qa/codex/pool-$label-missing.log"
rules_of() {
  case "$1" in
    car) echo "qa/codex/gen-rules-car.md";;
    watch) echo "qa/codex/gen-rules-watch.md";;
    home) echo "qa/codex/gen-rules-hm.md";;
    mobile|computer|gaming|audio|camera) echo "qa/codex/gen-rules-gear.md";;
    *) echo "-";;
  esac
}
name_of() {
  case "$1" in
    car) echo "자동차";; watch) echo "시계";; bag) echo "가방";; jewelry) echo "주얼리";; fashion) echo "패션";;
    mobile) echo "모바일";; computer) echo "컴퓨터";; gaming) echo "게임";; audio) echo "오디오";; camera) echo "카메라";;
    home) echo "가전";; pokemon) echo "포켓몬";; toy) echo "장난감";; outdoor) echo "아웃도어";; sport) echo "스포츠";; beauty) echo "뷰티";;
    *) echo "$1";;
  esac
}
declare -A tags_of
all=""
for cat in "$@"; do
  line=$(cd web && node scripts/catalog2/img-batch.mjs "$cat" "$stage" "$(rules_of "$cat")" 22 "$label" 2>/dev/null | tail -1)
  case "$line" in v2-*) tags_of[$cat]="$line"; all="$all $line";; *) echo "$cat: 만들 것 없음";; esac
done
[ -z "$all" ] && { echo "만들 것이 없다"; exit 0; }
echo "$(date +%H:%M) 단계 $stage, 묶음 $(echo $all | wc -w)개, 동시 $max"
: > "$misslog"
bash web/scripts/images/gen-run.sh "$max" $all > "$runlog" 2>&1 &
for cat in "$@"; do
  tags=(${tags_of[$cat]}); n=${#tags[@]}
  [ "$n" -eq 0 ] && continue
  parts=$(( (n + chunk - 1) / chunk ))
  for ((i = 0; i < n; i += chunk)); do
    part=("${tags[@]:i:chunk}")
    for t in "${part[@]}"; do
      until grep -q "done $t exit" "$runlog"; do sleep 15; done
      # Codex 가 결과 글 없이 끝난 묶음도 만들어 둔 원본은 변환한다
      [ -s "qa/codex/gen-out-$t.md" ] || echo "(결과 글 없이 끝남)" > "qa/codex/gen-out-$t.md"
    done
    bash web/scripts/images/gen-review.sh qa/catalog2/sheets "${part[@]}" 2>&1 | grep -E "원본 없음|failed|empty" > "qa/codex/pool-$label-part.log"
    miss=$(grep -c "원본 없음" "qa/codex/pool-$label-part.log"); cat "qa/codex/pool-$label-part.log" >> "$misslog"
    new=$(git status --short web/public/assets/photography | wc -l)
    if [ "$new" -gt 0 ]; then
      git add web/public/assets/photography web/scripts/images/generated.json web/scripts/images/studio.json 2>/dev/null
      git -c user.name=aresjoo -c user.email=blackethereum7@gmail.com commit -q -m "새 카탈로그 사진 ${stage}단계: $(name_of "$cat") $((i / chunk + 1))/$parts, ${new}장

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
      git push -q origin voila-redesign:main 2>&1 | tail -1
    fi
    echo "$(date +%H:%M) $cat $((i / chunk + 1))/$parts: 사진 ${new}장, 원본 없음 ${miss}"
  done
done
wait
echo "$(date +%H:%M) 전부 끝"
