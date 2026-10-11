#!/bin/sh
# Codex 생성 입력 파일을 만든다. 저장소 루트에서 실행.
#   sh web/scripts/images/gen-input.sh <범주 규칙 파일 또는 -> <목록 파일> <출력 파일>
# 지시서의 마지막 줄(목록 머리) 앞에 범주 규칙을 끼우고 목록을 붙인다.
rules="$1"; list="$2"; out="$3"
base="qa/codex/gen-images-prompt.md"
{
  sed '$d' "$base"
  if [ "$rules" != "-" ]; then cat "$rules"; echo; fi
  tail -n 1 "$base"
  cat "$list"
} > "$out"
echo "$out $(wc -l < "$list")"
