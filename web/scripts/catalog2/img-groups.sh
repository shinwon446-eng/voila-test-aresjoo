#!/bin/bash
# 카테고리를 묶음 여덟 안팎씩 모아 한 번에 돌린다(img-all.sh 는 카테고리를 하나씩 돌아 동시 생성이 둘셋뿐이다). 저장소 루트에서 실행.
#   bash web/scripts/catalog2/img-groups.sh <단계> <이름표> "<카테고리 ...>" ["<카테고리 ...>" ...]
#   예: bash web/scripts/catalog2/img-groups.sh 2 o2 "bag jewelry mobile" "fashion car audio camera"
# 따옴표 하나가 한 무리다. 무리마다 생성 → 변환까지 끝내고 다음 무리로 간다(중간에 멈춰도 끝난 무리는 남는다).
# 가상 메모리가 MIN_FREE_GB(기본 30) 아래로 내려가면 다음 무리를 시작하지 않는다(onedrive-commit-exhaustion).
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
free_gb() { powershell -NoProfile -Command "[math]::Floor((Get-CimInstance Win32_OperatingSystem).FreeVirtualMemory/1MB)" 2>/dev/null | tr -d '\r'; }
for group in "$@"; do
  free=$(free_gb)
  if [ -n "$free" ] && [ "$free" -lt "${MIN_FREE_GB:-30}" ]; then echo "$(date +%H:%M) 가상 메모리 ${free}GB, 멈춘다 (남은 무리: $group ...)"; exit 3; fi
  pairs=""
  for cat in $group; do pairs="$pairs $cat:$(rules_of "$cat")"; done
  echo "$(date +%H:%M) == $group (가상 메모리 ${free}GB)"
  bash web/scripts/catalog2/img-drive.sh "$stage" "$label" $pairs 2>&1 | grep -E "묶음|원본 없음|끝|없다" | cut -c1-200
done
echo "$(date +%H:%M) 전부 끝"
