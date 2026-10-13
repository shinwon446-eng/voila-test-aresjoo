#!/usr/bin/env bash
# 기준 빌드(로컬)와 다른 빌드를 견준다. migration-audit/harness 에서 실행.
#   bash run-compare.sh <이름> <견줄 빌드의 out 폴더(C:/... 꼴)> [motion]
# 결과: ../screenshots/after/<이름>, ../screenshots/diff/<이름>-vs-baseline-local, ../flows/<이름>, ../flows/compare-<이름>
# 셋째 인자가 motion 이면 개봉 연출도 잰다(다른 무거운 작업과 함께 돌리지 않는다).
cd "$(dirname "$0")" || exit 1
NAME="$1"; OUT="$2"; WITH_MOTION="$3"
BEFORE_OUT="C:/Users/hyun1/dev/VOILA-audit-before/web/out"
node serve.mjs "$BEFORE_OUT" 4173 > "../logs/serve-4173-$NAME.log" 2>&1 &
S1=$!
node serve.mjs "$OUT" 4174 > "../logs/serve-4174-$NAME.log" 2>&1 &
S2=$!
trap 'kill $S1 $S2 2>/dev/null' EXIT
sleep 2
BEFORE=http://127.0.0.1:4173/voila-test-aresjoo
AFTER=http://127.0.0.1:4174/voila-test-aresjoo
export MSYS_NO_PATHCONV=1
echo "== shots $(date +%H:%M)"
node shots.mjs "$NAME" "$AFTER" "../screenshots/after/$NAME" --workers 6 > "../logs/shots-$NAME.log" 2>&1
echo "shots exit $?"
node diff.mjs ../screenshots/after/baseline-local "../screenshots/after/$NAME" "../screenshots/diff/$NAME-vs-baseline-local" > "../logs/diff-$NAME.log" 2>&1
echo "diff exit $?"
# 목록에 오른 항목은 두 쪽에서 다시 찍고 다시 견준다(홈 배너의 흔들림을 가린다). 기준 쪽은 사본에 찍어 기준선을 건드리지 않는다
R="$(cat "../screenshots/diff/$NAME-vs-baseline-local/reshoot.txt" 2>/dev/null)"
if [ -n "$R" ]; then
  echo "== reshoot $(echo "$R" | tr ',' '\n' | wc -l) 항목 $(date +%H:%M)"
  node shots.mjs "$NAME" "$AFTER" "../screenshots/after/$NAME" --only "$R" >> "../logs/shots-$NAME.log" 2>&1
  node shots.mjs before-local "$BEFORE" ../screenshots/after/baseline-local --only "$R" >> "../logs/shots-$NAME.log" 2>&1
  node diff.mjs ../screenshots/after/baseline-local "../screenshots/after/$NAME" "../screenshots/diff/$NAME-vs-baseline-local" >> "../logs/diff-$NAME.log" 2>&1
  echo "rediff exit $?"
fi
# 차이를 규칙(classify-rules.json)에 비춰 나눈다. 설명되지 않은 항목은 한 번 다시 찍어 본다(홈 배너의 흔들림처럼 한 번만 생기는 것을 가린다)
node classify.mjs "../screenshots/diff/$NAME-vs-baseline-local" > "../logs/classify-$NAME.log" 2>&1
echo "classify exit $?"
U="$(cat "../screenshots/diff/$NAME-vs-baseline-local/reshoot-unexplained.txt" 2>/dev/null)"
if [ -n "$U" ]; then
  echo "== 설명되지 않은 $(echo "$U" | tr ',' '\n' | wc -l) 항목을 다시 찍음 $(date +%H:%M)"
  cp "../screenshots/diff/$NAME-vs-baseline-local/CLASSIFIED.md" "../screenshots/diff/$NAME-vs-baseline-local/CLASSIFIED.first-pass.md"
  node shots.mjs "$NAME" "$AFTER" "../screenshots/after/$NAME" --only "$U" >> "../logs/shots-$NAME.log" 2>&1
  node shots.mjs before-local "$BEFORE" ../screenshots/after/baseline-local --only "$U" >> "../logs/shots-$NAME.log" 2>&1
  node diff.mjs ../screenshots/after/baseline-local "../screenshots/after/$NAME" "../screenshots/diff/$NAME-vs-baseline-local" >> "../logs/diff-$NAME.log" 2>&1
  node classify.mjs "../screenshots/diff/$NAME-vs-baseline-local" >> "../logs/classify-$NAME.log" 2>&1
  echo "reclassify exit $?"
fi
echo "== flows $(date +%H:%M)"
node flows.mjs "$NAME" "$AFTER" "../flows/$NAME" > "../logs/flows-$NAME.log" 2>&1
echo "flows exit $?"
node flows-compare.mjs ../flows/before-local "../flows/$NAME" "../flows/compare-$NAME" >> "../logs/flows-$NAME.log" 2>&1
echo "flows-compare exit $?"
if [ "$WITH_MOTION" = "motion" ]; then
  echo "== motion $(date +%H:%M)"
  node motion.mjs "$NAME" "$AFTER" > "../logs/motion-$NAME.log" 2>&1
  echo "motion exit $?"
  node motion-compare.mjs ../motion/before-local "../motion/$NAME" "../motion/compare-$NAME" >> "../logs/motion-$NAME.log" 2>&1
  echo "motion-compare exit $?"
fi
echo "== 끝 $(date +%H:%M)"
