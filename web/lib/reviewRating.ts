// 별점 요약의 꼴과 셈. 샘플 생성기(lib/reviewSamples)와 화면의 집계(lib/reviewFeed, lib/reviewSampleGate)가 같이 쓴다.
// 생성기와 떨어뜨려 둔 까닭: 샘플을 끈 빌드는 생성기를 묶음에 넣지 않는데(lib/reviewSampleGate), 실제 후기의 별점은 그때도 세어야 한다.

export interface RatingSummary {
  count: number;
  /** 평균(소수 첫째 자리). 후기가 없으면 null */
  avg: number | null;
  /** [1점, 2점, 3점, 4점, 5점] */
  dist: [number, number, number, number, number];
}

export const summaryOf = (dist: RatingSummary["dist"]): RatingSummary => {
  const count = dist.reduce((a, b) => a + b, 0);
  const sum = dist.reduce((a, n, i) => a + n * (i + 1), 0);
  return { count, avg: count ? Math.round((sum / count) * 10) / 10 : null, dist };
};

/** 점수들의 요약. 1 에서 5 사이의 정수만 센다 */
export function summarizeRatings(ratings: readonly number[]): RatingSummary {
  const dist: RatingSummary["dist"] = [0, 0, 0, 0, 0];
  for (const r of ratings) if (Number.isInteger(r) && r >= 1 && r <= 5) dist[r - 1] += 1;
  return summaryOf(dist);
}
