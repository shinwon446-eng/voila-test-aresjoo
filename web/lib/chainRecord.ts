/**
 * 개봉 결과 검증의 둘째 단계 "블록체인 기록"의 상태(flow/MELT_SPEC.md S9). 순수 함수라 화면 없이 시험한다(tests/chainRecord.test.ts).
 *
 * 상태는 다섯: none(기록 없음), pending(확정 전), confirmed(확정), mismatch(다름), error(불러오기 실패).
 * 이 테스트 사이트는 잠근 값을 블록체인에 올리지 않는다. 그래서 실제 개봉 기록의 상태는 언제나 none 이다(chainRecordOf).
 * 나머지 넷의 모습은 개발용 화면(/dev/gallery)이 고정 자료로만 보여 준다. 사용자 화면은 chainRecordOf 의 결과만 쓴다:
 * 지어낸 기록 주소를 사용자 화면에 내지 않는다.
 *
 * 성공 문장("열기 전 기록과 공개된 값, 받은 상품이 일치합니다.")은 confirmed 에서만 나온다.
 * confirmed 라고 들어왔어도 체인 이름, 기록 주소, 바깥 주소 가운데 하나라도 비면 확인할 수 없는 것으로 보고 error 로 낮춘다.
 */
import type { OwnedItem } from "../stores/inventoryStore";

export type ChainState = "none" | "pending" | "confirmed" | "mismatch" | "error";

export interface ChainRecord {
  state: ChainState;
  /** 체인 이름 */
  chain?: string;
  /** 기록 주소(거래 id) */
  address?: string;
  /** 바깥 탐색기에서 그 기록을 여는 주소 */
  url?: string;
}

export const NO_CHAIN_RECORD: ChainRecord = { state: "none" };

/** 실제 개봉 기록의 블록체인 상태. 이 테스트 사이트는 체인에 올리지 않으므로 언제나 기록 없음이다. */
export function chainRecordOf(_record: Pick<OwnedItem, "fair"> | null | undefined): ChainRecord {
  return NO_CHAIN_RECORD;
}

/** 화면이 그대로 그리는 모양. 문구는 v.verify.chain 아래의 키다 */
export interface ChainView {
  state: ChainState;
  /** 상태 한마디의 키 */
  status: string;
  /** 그 아래 한 줄의 키 */
  body: string;
  /** body 가 실패나 다름을 알리는 줄인가(빨강은 실패 한 곳에만) */
  fail: boolean;
  /** 성공 문장인가. confirmed 에서만 true */
  success: boolean;
  /** 체인 이름과 기록 주소 행을 그리는가 */
  chain: string | null;
  address: string | null;
  /** "블록체인에서 기록 보기"의 주소 */
  url: string | null;
  /** "다시 확인" 을 내는가 */
  retry: boolean;
}

const has = (s: string | undefined): s is string => typeof s === "string" && s.trim().length > 0;

export function chainView(record: ChainRecord | null | undefined): ChainView {
  const state: ChainState = !record ? "none"
    : record.state === "confirmed" && !(has(record.chain) && has(record.address) && has(record.url)) ? "error"
    : (["none", "pending", "confirmed", "mismatch", "error"] as const).includes(record.state) ? record.state : "error";
  const evidence = state === "pending" || state === "confirmed" || state === "mismatch";
  const key = "verify.chain.";
  return {
    state,
    status: key + state,
    body: key + (state === "confirmed" ? "ok" : state + "Body"),
    fail: state === "mismatch" || state === "error",
    success: state === "confirmed",
    chain: evidence && has(record?.chain) ? record!.chain!.trim() : null,
    address: evidence && has(record?.address) ? record!.address!.trim() : null,
    url: evidence && has(record?.url) ? record!.url!.trim() : null,
    retry: state === "error",
  };
}
