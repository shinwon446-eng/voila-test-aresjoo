// 화면이 샘플 후기를 받는 문. 화면(components, lib/reviewFeed)은 생성기(lib/reviewSamples)를 직접 부르지 않고 여기를 거친다.
// 까닭(2차 검수 F-04): 샘플을 끈 빌드(NEXT_PUBLIC_SAMPLE_REVIEWS=off)는 화면에 샘플이 한 건도 없는데도, 생성기와 말뭉치(lib/reviewSampleText,
//   후기 문장과 별명 전부)가 JS 묶음에 실려 손님 기기로 내려갔다. 스위치를 함수 안에서 보면 묶는 도구는 그 코드가 안 쓰이는 줄 모른다.
// 그래서 스위치를 이 파일의 맨 위에서, 묶는 도구가 빌드할 때 값을 아는 꼴로 한 번 본다:
//   빌드할 때 process.env.NEXT_PUBLIC_SAMPLE_REVIEWS 는 글자로 바뀌고("off" === "off"), 조건이 참으로 굳으면 require 가 든 가지는 통째로 빠진다.
//   조건을 변수나 함수에 담으면 굳지 않는다. 아래의 한 줄을 그 꼴 그대로 둔다(끄는 값 셋은 lib/reviewSamples 의 sampleReviewsOn 과 같다).
//   import 로 바꾸면 조건과 상관없이 묶음에 들어가고, import() 로 바꾸면 나중에 들어와서 미리 그린 HTML 과 어긋난다.
// 켜진 빌드(값을 주지 않은 빌드 포함)에서는 생성기의 같은 함수를 같은 때에 그대로 부른다: 화면도, 미리 그린 HTML 도 달라지지 않는다.
// 끈 빌드에서는 생성기가 스위치를 끈 때에 주던 답을 여기서 바로 준다: 샘플은 없고, 별점은 이 기기에서 실제로 쓴 후기만으로 센다.
// 검사와 점검 도구는 생성기를 직접 부른다(이 문은 화면의 것이다).
import type * as Samples from "./reviewSamples";
import { summarizeRatings, type RatingSummary } from "./reviewRating";

const gen: typeof Samples | null = process.env.NEXT_PUBLIC_SAMPLE_REVIEWS === "off" || process.env.NEXT_PUBLIC_SAMPLE_REVIEWS === "0" || process.env.NEXT_PUBLIC_SAMPLE_REVIEWS === "false" ? null : (require("./reviewSamples") as typeof Samples);

/** 이 박스의 샘플 후기를 새것부터 limit 건 */
export const sampleReviews = (boxSlug: string, limit?: number): Samples.ReviewSample[] => (gen ? gen.sampleReviews(boxSlug, limit) : []);
/** 모든 박스의 샘플 후기를 새것부터 limit 건 */
export const newestSamples = (limit: number): Samples.ReviewSample[] => (gen ? gen.newestSamples(limit) : []);
/** 박스의 별점 요약(샘플 위에 실제 후기의 점수 extra 를 더한 것) */
export const ratingSummary = (boxSlug: string, extra: readonly number[] = []): RatingSummary => (gen ? gen.ratingSummary(boxSlug, extra) : summarizeRatings(extra));
/** 모든 박스의 별점 요약 */
export const allRatingSummary = (extra: readonly number[] = []): RatingSummary => (gen ? gen.allRatingSummary(extra) : summarizeRatings(extra));
