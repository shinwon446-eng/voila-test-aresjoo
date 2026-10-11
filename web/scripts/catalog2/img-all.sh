#!/bin/bash
# 카테고리를 하나씩 돌며 사진을 만든다(카테고리마다 생성 → 변환까지 끝내고 다음으로. 중간에 멈춰도 끝난 카테고리는 남는다). 저장소 루트에서 실행.
#   bash web/scripts/catalog2/img-all.sh <단계> <이름표> [카테고리 ...]
# 카테고리를 주지 않으면 포켓몬을 뺀 열다섯을 정해진 차례로 돈다. 포켓몬은 그림 도구가 거절해 만들지 않는다.
stage="$1"; label="$2"; shift 2
rules_of() {
  case "$1" in
    car) echo "qa/codex/gen-rules-car.md";;
    watch) echo "qa/codex/gen-rules-watch.md";;
    home) echo "qa/codex/gen-rules-hm.md";;
    mobile|computer|gaming|audio|camera) echo "qa/codex/gen-rules-gear.md";;
    *) echo "-";;
  esac
}
cats="$@"
[ -z "$cats" ] && cats="watch bag jewelry mobile fashion car audio camera home computer gaming toy sport beauty outdoor"
for cat in $cats; do
  echo "$(date +%H:%M) == $cat"
  bash web/scripts/catalog2/img-drive.sh "$stage" "$label" "$cat:$(rules_of "$cat")" 2>&1 | grep -E "묶음|원본 없음|끝|없다" | cut -c1-200
done
echo "$(date +%H:%M) 전부 끝"
