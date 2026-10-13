#!/usr/bin/env bash
# 2차 라운드 최종 실행(after-final3, f830d9e)의 첫 묶음: 촬영, 비교, 1차 분류, 한 빌드 안의 변종 재기, 변종 자료를 준 분류.
# 기준 서버는 4183, 결과 서버는 4189 에 떠 있어야 한다. 기준 쪽 촬영(../screenshots/after/baseline-local)은 같은 도구로 찍어 둔 것을 그대로 쓴다.
set -u
cd C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/harness
export MSYS_NO_PATHCONV=1
BEFORE=http://127.0.0.1:4183/voila-test-aresjoo
AFTER=http://127.0.0.1:4189/voila-test-aresjoo
D=../screenshots/diff/after-final3-vs-baseline-local
L=../logs
step() { echo "== $1 $(date +%H:%M:%S)"; }

step shots
node shots.mjs after-final3 $AFTER ../screenshots/after/after-final3 --workers 6 > $L/r3-shots-after-final3.log 2>&1; echo "exit $?" >> $L/r3-shots-after-final3.log
tail -3 $L/r3-shots-after-final3.log
step diff
node diff.mjs ../screenshots/after/baseline-local ../screenshots/after/after-final3 $D > $L/r3-diff.log 2>&1; echo "exit $?" >> $L/r3-diff.log
tail -3 $L/r3-diff.log
step classify-first
node classify.mjs $D > $L/r3-classify-first.log 2>&1; echo "exit $?" >> $L/r3-classify-first.log
tail -3 $L/r3-classify-first.log
cp $D/CLASSIFIED.md $D/CLASSIFIED.first-pass.md; cp $D/classified.json $D/classified.first-pass.json; cp $D/reshoot-unexplained.txt $D/reshoot-unexplained.first-pass.txt

# 한 빌드 안의 변종: 앞선 실행에서 흔들린 여섯 항목에 이번에 설명 안 된 항목을 더해 두 빌드에서 8번씩
IDS=overlay/footer-controls/ko-1440-guest,overlay/footer-controls/ko-390-guest,overlay/footer-controls/zh-390-guest,route/home/ko-1280-guest,route/home/zh-1440-guest,state/home/zh-390-inventory
UN="$(cat $D/reshoot-unexplained.first-pass.txt)"
if [ -n "$UN" ]; then IDS="$IDS,$UN"; fi
echo "repeat ids: $IDS"
step repeat-baseline
node tools/repeat.mjs $BEFORE ../qa/r3-repeat/baseline 8 --only "$IDS" > $L/r3-repeat-baseline.log 2>&1; echo "exit $?" >> $L/r3-repeat-baseline.log
tail -2 $L/r3-repeat-baseline.log
step repeat-final3
node tools/repeat.mjs $AFTER ../qa/r3-repeat/after-final3 8 --only "$IDS" > $L/r3-repeat-after-final3.log 2>&1; echo "exit $?" >> $L/r3-repeat-after-final3.log
tail -2 $L/r3-repeat-after-final3.log
step repeat-desktop-final3
node tools/repeat.mjs $AFTER ../qa/r3-repeat-desktop/after-final3 24 --only route/home --widths 1280,1440 --locales ko,en,zh > $L/r3-repeat-desktop-after-final3.log 2>&1; echo "exit $?" >> $L/r3-repeat-desktop-after-final3.log
tail -2 $L/r3-repeat-desktop-after-final3.log
step variants
node tools/variants.mjs ../qa/r3-repeat/baseline ../qa/r3-repeat/after-final3 ../qa/r3-variants.json all > $L/r3-variants.log 2>&1; echo "exit $?" >> $L/r3-variants.log
node tools/variants.mjs ../qa/r3-repeat-desktop/after-final3 ../qa/r3-repeat-desktop/after-final3 ../qa/r3-variants-desktop-after-final3.json hero,header >> $L/r3-variants.log 2>&1
tail -16 $L/r3-variants.log
step classify-variants
node classify.mjs $D --variants ../qa/r3-variants.json > $L/r3-classify.log 2>&1; echo "exit $?" >> $L/r3-classify.log
tail -3 $L/r3-classify.log
step done
