#!/usr/bin/env bash
# 마지막 한 줄 수정(지갑 내역의 날짜와 상태를 원본과 같은 두 글 조각으로) 뒤: 빌드, 지갑이 나오는 촬영만 다시, 분류, 흐름 전부.
# migration-audit/harness 에서 실행. 그 밖의 화면은 after-final3(f830d9e)의 촬영을 그대로 쓴다(바뀐 파일은 WalletScreen.tsx 한 줄뿐이다).
cd "$(dirname "$0")" || exit 1
RESULT=/c/Users/hyun1/dev/VOILA-audit-reviews
LOGS=../logs
OUT=/c/Users/hyun1/dev/VOILA-audit-out/after-final4
echo "== 빌드 $(git -C "$RESULT" rev-parse --short HEAD) $(date +%H:%M)"
( cd "$RESULT/web" && rm -rf .next out && GITHUB_PAGES=true NEXT_PUBLIC_AUTH_API_BASE= NEXT_PUBLIC_API_BASE= npx next build > /c/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/logs/build-final4.log 2>&1; echo "build exit $? html $(find out -name '*.html' | wc -l)" )
rm -rf "$OUT" && cp -r "$RESULT/web/out" "$OUT" && git -C "$RESULT" rev-parse HEAD > "$OUT/BUILD_COMMIT.txt" && echo "복사 끝 $(date +%H:%M)"
node serve.mjs C:/Users/hyun1/dev/VOILA-audit-before/web/out 4193 > "$LOGS/serve-4193.log" 2>&1 &
S1=$!
node serve.mjs C:/Users/hyun1/dev/VOILA-audit-out/after-final4 4194 > "$LOGS/serve-4194.log" 2>&1 &
S2=$!
trap 'kill $S1 $S2 2>/dev/null' EXIT
sleep 2
export MSYS_NO_PATHCONV=1
BEFORE=http://127.0.0.1:4193/voila-test-aresjoo
AFTER=http://127.0.0.1:4194/voila-test-aresjoo
# after-final3 의 촬영을 바탕으로 두고 지갑이 나오는 항목만 새 빌드에서 다시 찍는다
rm -rf ../screenshots/after/after-final4 && cp -r ../screenshots/after/after-final3 ../screenshots/after/after-final4
ONLY="wallet,tx-detail,zero-withdraw,withdraw,balance"
V=ko-390,en-1440,zh-390,ko-1440,en-390
echo "== 지갑 항목 다시 찍기 $(date +%H:%M)"
node shots.mjs after-final4 "$AFTER" ../screenshots/after/after-final4 --only "$ONLY" > "$LOGS/shots-after-final4.log" 2>&1
echo "shots exit $? $(tail -c 120 "$LOGS/shots-after-final4.log" | tr '\n' ' ')"
node diff.mjs ../screenshots/after/baseline-local ../screenshots/after/after-final4 ../screenshots/diff/after-final4-vs-baseline-local > "$LOGS/diff-after-final4.log" 2>&1
echo "diff exit $?"
node classify.mjs ../screenshots/diff/after-final4-vs-baseline-local --variants ../qa/r3-variants.json > "$LOGS/classify-after-final4.log" 2>&1
echo "classify exit $?"
grep -E "^\| (identical|noise|intended|background-only|position-aa|within-build|UNEXPLAINED|not-)" ../screenshots/diff/after-final4-vs-baseline-local/CLASSIFIED.md | head -12
echo "== 흐름 $(date +%H:%M)"
node flows.mjs after-final4 "$AFTER" ../flows/after-final4 --variants "$V" --workers 3 > "$LOGS/flows-after-final4.log" 2>&1
echo "flows exit $?"
node flows-compare.mjs ../flows/r3-before-local ../flows/after-final4 ../flows/compare-after-final4 >> "$LOGS/flows-after-final4.log" 2>&1
echo "flows-compare exit $?"
grep -n "단계 합계" ../flows/compare-after-final4/FLOWS_COMPARE.md | cut -c1-200
echo "== 끝 $(date +%H:%M)"
