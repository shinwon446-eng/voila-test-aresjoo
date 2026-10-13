#!/usr/bin/env bash
# 마지막 결과 커밋을 두 가지로 빌드한다: 보통 빌드와 샘플 후기 스위치를 끈 빌드. 끈 빌드에 샘플 글이 실리지 않는지도 찾는다.
RESULT=/c/Users/hyun1/dev/VOILA-audit-reviews
LOGS=/c/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/logs
OUTS=/c/Users/hyun1/dev/VOILA-audit-out
cd "$RESULT/web" || exit 1
echo "== 커밋 $(git -C .. rev-parse --short HEAD) $(date +%H:%M)"
( npx tsc --noEmit -p . > "$LOGS/final3-tsc.log" 2>&1; echo "tsc exit $?" )
( npm test > "$LOGS/final3-test.log" 2>&1; grep -E "ℹ (tests|pass|fail|skipped)" "$LOGS/final3-test.log" | tr '\n' ' '; echo )
( npm run lint:design > "$LOGS/final3-lint.log" 2>&1; tail -1 "$LOGS/final3-lint.log" )
rm -rf .next out
NEXT_PUBLIC_SAMPLE_REVIEWS=off GITHUB_PAGES=true NEXT_PUBLIC_AUTH_API_BASE= NEXT_PUBLIC_API_BASE= npx next build > "$LOGS/build-final3-off.log" 2>&1
echo "끈 빌드 exit $? html $(find out -name '*.html' | wc -l) $(date +%H:%M)"
for frag in "뽁뽁이 엄청 감아서" "번창하세요" "Did not expect to actually win this"; do
  echo "  끈 빌드에서 \"$frag\": $(grep -rl --include='*.js' --include='*.html' -F "$frag" out | wc -l) 파일"
done
rm -rf "$OUTS/after-final3-off" && cp -r out "$OUTS/after-final3-off" && git -C .. rev-parse HEAD > "$OUTS/after-final3-off/BUILD_COMMIT.txt"
rm -rf .next out
GITHUB_PAGES=true NEXT_PUBLIC_AUTH_API_BASE= NEXT_PUBLIC_API_BASE= npx next build > "$LOGS/build-final3.log" 2>&1
echo "보통 빌드 exit $? html $(find out -name '*.html' | wc -l) $(date +%H:%M)"
for frag in "뽁뽁이 엄청 감아서" "번창하세요" "Did not expect to actually win this"; do
  echo "  보통 빌드에서 \"$frag\": $(grep -rl --include='*.js' --include='*.html' -F "$frag" out | wc -l) 파일"
done
rm -rf "$OUTS/after-final3" && cp -r out "$OUTS/after-final3" && git -C .. rev-parse HEAD > "$OUTS/after-final3/BUILD_COMMIT.txt"
echo "== 끝 $(date +%H:%M)"
