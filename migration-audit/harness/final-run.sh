#!/usr/bin/env bash
# 최종 결과 브랜치를 빌드하고, 기준 빌드와 전부 견준다(촬영, 분류, 흐름, 연출). migration-audit/harness 에서 실행.
cd "$(dirname "$0")" || exit 1
RESULT=/c/Users/hyun1/dev/VOILA-audit-reviews
OUT=/c/Users/hyun1/dev/VOILA-audit-out/after-final
echo "== 빌드 $(date +%H:%M) $(git -C "$RESULT" rev-parse --short HEAD)"
( cd "$RESULT/web" && rm -rf .next out && GITHUB_PAGES=true NEXT_PUBLIC_AUTH_API_BASE= NEXT_PUBLIC_API_BASE= npx next build > ../../VOILA-test-aresjoo/migration-audit/logs/build-after-final.log 2>&1 )
echo "build exit $? html $(find "$RESULT/web/out" -name '*.html' | wc -l)"
rm -rf "$OUT" && cp -r "$RESULT/web/out" "$OUT" && echo "복사 끝 $(date +%H:%M)"
git -C "$RESULT" rev-parse HEAD > "$OUT/BUILD_COMMIT.txt"
bash run-compare.sh after-final C:/Users/hyun1/dev/VOILA-audit-out/after-final motion
echo "== 검사 $(date +%H:%M)"
( cd "$RESULT/web" && npx tsc --noEmit -p . > ../../VOILA-test-aresjoo/migration-audit/logs/final-tsc.log 2>&1; echo "tsc exit $?"; npm test > ../../VOILA-test-aresjoo/migration-audit/logs/final-test.log 2>&1; grep -E "ℹ (tests|pass|fail|skipped)" ../../VOILA-test-aresjoo/migration-audit/logs/final-test.log | tr '\n' ' '; echo; npm run lint:design > ../../VOILA-test-aresjoo/migration-audit/logs/final-lint.log 2>&1; tail -1 ../../VOILA-test-aresjoo/migration-audit/logs/final-lint.log )
echo "== 전부 끝 $(date +%H:%M)"
