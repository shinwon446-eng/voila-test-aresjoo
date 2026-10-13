#!/usr/bin/env bash
# 2차 라운드 최종 실행(after-final3, f830d9e)의 둘째 묶음: 흐름(두 빌드를 같은 도구, 같은 절차로 처음부터)과 연출(다른 작업 없이 따로).
# 첫 묶음(r2-final3-step1.sh)이 끝난 뒤에 시작한다. 연출은 길이를 재므로 다른 무거운 작업과 겹치지 않게 한 줄로 세운다.
set -u
cd C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/harness
export MSYS_NO_PATHCONV=1
BEFORE=http://127.0.0.1:4183/voila-test-aresjoo
AFTER=http://127.0.0.1:4189/voila-test-aresjoo
L=../logs
V=ko-390,en-1440,zh-390,ko-1440,en-390
step() { echo "== $1 $(date +%H:%M:%S)"; }

until grep -q "^exit" $L/r3-classify.log 2>/dev/null; do sleep 20; done

step flows-baseline
node flows.mjs before-local $BEFORE ../flows/r3-before-local --variants $V --workers 3 > $L/r3-flows-baseline.log 2>&1; echo "exit $?" >> $L/r3-flows-baseline.log
tail -2 $L/r3-flows-baseline.log
step flows-final3
node flows.mjs after-final3 $AFTER ../flows/after-final3 --variants $V --workers 3 > $L/r3-flows-after-final3.log 2>&1; echo "exit $?" >> $L/r3-flows-after-final3.log
tail -2 $L/r3-flows-after-final3.log
node flows-compare.mjs ../flows/r3-before-local ../flows/after-final3 ../flows/compare-after-final3 > $L/r3-flows-compare.log 2>&1; echo "exit $?" >> $L/r3-flows-compare.log
tail -4 $L/r3-flows-compare.log

step motion-baseline-ko390
node motion.mjs before-local $BEFORE ../motion/r3-before-local > $L/r3-motion-baseline-ko390.log 2>&1; echo "exit $?" >> $L/r3-motion-baseline-ko390.log
step motion-final3-ko390
node motion.mjs after-final3 $AFTER ../motion/after-final3 > $L/r3-motion-after-final3-ko390.log 2>&1; echo "exit $?" >> $L/r3-motion-after-final3-ko390.log
node motion-compare.mjs ../motion/r3-before-local ../motion/after-final3 ../motion/compare-after-final3 > $L/r3-motion-compare-ko390.log 2>&1
tail -3 $L/r3-motion-compare-ko390.log
step motion-baseline-en1440
node motion.mjs before-local-en-1440 $BEFORE ../motion/r3-before-local-en-1440 --locale en --width 1440 > $L/r3-motion-baseline-en1440.log 2>&1; echo "exit $?" >> $L/r3-motion-baseline-en1440.log
step motion-final3-en1440
node motion.mjs after-final3-en-1440 $AFTER ../motion/after-final3-en-1440 --locale en --width 1440 > $L/r3-motion-after-final3-en1440.log 2>&1; echo "exit $?" >> $L/r3-motion-after-final3-en1440.log
node motion-compare.mjs ../motion/r3-before-local-en-1440 ../motion/after-final3-en-1440 ../motion/compare-after-final3-en-1440 > $L/r3-motion-compare-en1440.log 2>&1
tail -3 $L/r3-motion-compare-en1440.log

# 다시 재기(6번씩): 느린 기기 흉내와 20배 이상 결과. 그리고 후기 구역을 감춘 채로 같은 경우
step motion-rerun
R=../motion/rerun-r3
node motion.mjs before-local-rerun $BEFORE $R/before-local --only one-slow4x,tone-top --runs 6 > $L/r3-motion-rerun.log 2>&1
node motion.mjs after-final3-rerun $AFTER $R/after-final3 --only one-slow4x,tone-top --runs 6 >> $L/r3-motion-rerun.log 2>&1
node motion-compare.mjs $R/before-local $R/after-final3 $R/compare >> $L/r3-motion-rerun.log 2>&1
export PARITY_MOTION_CSS='.v-boxlayout-reviews, .v-ratinglink { display: none !important; }'
node motion.mjs before-local-reviews-hidden $BEFORE $R/before-local-reviews-hidden --only tone-top --runs 6 >> $L/r3-motion-rerun.log 2>&1
node motion.mjs after-final3-reviews-hidden $AFTER $R/after-final3-reviews-hidden --only tone-top --runs 6 >> $L/r3-motion-rerun.log 2>&1
unset PARITY_MOTION_CSS
echo "exit 0" >> $L/r3-motion-rerun.log
step done
