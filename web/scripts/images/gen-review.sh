#!/bin/bash
# 끝난 생성 묶음을 등록하고 같은 톤으로 변환한 뒤 검수 시트를 만든다. 저장소 루트에서 실행.
#   bash web/scripts/images/gen-review.sh <시트 폴더> <태그> <태그> ...
# 묶음이 끝났는지는 qa/codex/gen-out-<태그>.md 가 있는지로 본다(도는 중인 묶음의 쓰다 만 원본을 변환하지 않게).
out="$1"; shift
mkdir -p "$out"
for tag in "$@"; do
  if [ ! -s "qa/codex/gen-out-$tag.md" ]; then echo "$tag: 아직 안 끝남"; continue; fi
  ids=""
  for id in $(grep -o -E '^- [a-z0-9-]+ \|' "qa/codex/gen-input-$tag.md" | sed -E 's/^- ([a-z0-9-]+) \|/\1/'); do
    if [ -s "web/scripts/images/gen-raw/$id.png" ]; then ids="$ids,$id"; else echo "$tag: 원본 없음 $id"; fi
  done
  ids="${ids#,}"
  if [ -z "$ids" ]; then echo "$tag: 변환할 것 없음"; continue; fi
  (cd web && node scripts/images/gen-register.mjs > /dev/null && node scripts/images/studio.mjs --only "$ids" 2>&1 | grep -E "failed|empty" ; node scripts/images/sheet.mjs "../$out/gen-$tag.png" --prefix studio- --ids "$ids" 2>&1 | tail -1)
done
